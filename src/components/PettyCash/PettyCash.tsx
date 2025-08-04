import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Minus, Wallet, Trash2, Download, FileText, Upload, Paperclip, FileSpreadsheet } from 'lucide-react';
import { exportPettyCashToPDF, exportPettyCashToExcel } from '../../utils/exportUtils';
import ExcelImport from '../Import/ExcelImport';

const PettyCash: React.FC = () => {
  const { pettyCashEntries, addPettyCashEntry, deletePettyCashEntry, updatePettyCashEntry } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'add' as 'add' | 'withdraw',
    date: new Date().toISOString().split('T')[0]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleReceiptUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !selectedEntryId) return;
    
    const receiptUrl = URL.createObjectURL(selectedFile);
    
    const entry = pettyCashEntries.find(e => e.id === selectedEntryId);
    if (entry) {
      updatePettyCashEntry(selectedEntryId, {
        ...entry,
        receiptUrl,
        receiptFile: selectedFile
      });
    }
    
    setSelectedFile(null);
    setSelectedEntryId('');
    setShowReceiptUpload(false);
  };

  const openReceiptUpload = (entryId: string) => {
    setSelectedEntryId(entryId);
    setSelectedFile(null);
    setShowReceiptUpload(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let receiptUrl = '';
    if (selectedFile) {
      // In a real app, you would upload to a server or cloud storage
      receiptUrl = URL.createObjectURL(selectedFile);
    }
    
    addPettyCashEntry({
      amount: parseFloat(formData.amount),
      description: formData.description,
      type: formData.type,
      date: formData.date,
      receiptUrl,
      receiptFile: selectedFile || undefined
    });
    
    setFormData({
      amount: '',
      description: '',
      type: 'add',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedFile(null);
    setShowForm(false);
  };

  const handleBulkImport = (data: any[]) => {
    data.forEach(row => {
      addPettyCashEntry({
        amount: parseFloat(row.amount.toString()),
        description: row.description || '',
        type: row.type === 'withdraw' ? 'withdraw' : 'add',
        date: row.date || new Date().toISOString().split('T')[0]
      });
    });
  };

  const currentBalance = pettyCashEntries.reduce((balance, entry) => {
    return entry.type === 'add' ? balance + entry.amount : balance - entry.amount;
  }, 0);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this petty cash entry?')) {
      deletePettyCashEntry(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Petty Cash Management</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <button
                onClick={() => exportPettyCashToPDF(pettyCashEntries)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as PDF
              </button>
              <button
                onClick={() => exportPettyCashToExcel(pettyCashEntries)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as Excel
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import Excel
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Current Balance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <Wallet className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4 text-center">
            <h2 className="text-lg font-medium text-gray-900">Current Petty Cash Balance</h2>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(currentBalance)}</p>
          </div>
        </div>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Petty Cash Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'add' | 'withdraw' })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value="add">Add Money</option>
                  <option value="withdraw">Withdraw Money</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (KES)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder="Enter description for this transaction"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Attachment (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </label>
                {selectedFile && (
                  <span className="text-sm text-gray-600 flex items-center">
                    <Paperclip className="h-4 w-4 mr-1" />
                    {selectedFile.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Entry
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <ExcelImport
          onImport={handleBulkImport}
          onClose={() => setShowImport(false)}
          templateColumns={['date', 'type', 'description', 'amount']}
          title="Petty Cash Data"
          sampleData={[
            {
              date: '2024-01-15',
              type: 'add',
              description: 'Initial petty cash fund',
              amount: 10000
            },
            {
              date: '2024-01-16',
              type: 'withdraw',
              description: 'Office supplies purchase',
              amount: 1500
            }
          ]}
        />
      )}

      {/* Receipt Upload Modal */}
      {showReceiptUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Upload Receipt</h2>
            </div>
            <form onSubmit={handleReceiptUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Receipt File
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="petty-cash-receipt-upload-modal"
                    required
                  />
                  <label
                    htmlFor="petty-cash-receipt-upload-modal"
                    className="cursor-pointer bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <Paperclip className="h-4 w-4 mr-1" />
                      {selectedFile.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptUpload(false)}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pettyCashEntries.length > 0 ? (
                pettyCashEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.type === 'add' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.type === 'add' ? (
                            <Plus className="h-3 w-3 mr-1" />
                          ) : (
                            <Minus className="h-3 w-3 mr-1" />
                          )}
                          {entry.type === 'add' ? 'Add' : 'Withdraw'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={entry.type === 'add' ? 'text-green-600' : 'text-red-600'}>
                          {entry.type === 'add' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.receiptUrl ? (
                          <a
                            href={entry.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Paperclip className="h-4 w-4 mr-1" />
                            View
                          </a>
                        ) : (
                          <button
                            onClick={() => openReceiptUpload(entry.id)}
                            className="text-green-600 hover:text-green-800 flex items-center text-sm"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Add Receipt
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {entry.receiptUrl && (
                            <button
                              onClick={() => openReceiptUpload(entry.id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Update receipt"
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No petty cash entries yet. Add your first entry to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PettyCash;