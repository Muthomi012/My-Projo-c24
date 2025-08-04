import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Trash2, TrendingUp, Battery, Megaphone, Calendar, Download, FileText, Upload, Paperclip, FileSpreadsheet } from 'lucide-react';
import { exportTransactionsToPDF, exportTransactionsToExcel } from '../../utils/exportUtils';
import ExcelImport from '../Import/ExcelImport';

const incomeCategories = [
  'Advertisements',
  'Powerbank Sales',
  'Powerbank Rentals',
  'Events',
  'Other'
];

const Income: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const incomeTransactions = transactions.filter(t => t.type === 'income');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleReceiptUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !selectedTransactionId) return;
    
    const receiptUrl = URL.createObjectURL(selectedFile);
    
    const transaction = transactions.find(t => t.id === selectedTransactionId);
    if (transaction) {
      updateTransaction(selectedTransactionId, {
        ...transaction,
        receiptUrl,
        receiptFile: selectedFile
      });
    }
    
    setSelectedFile(null);
    setSelectedTransactionId('');
    setShowReceiptUpload(false);
  };

  const openReceiptUpload = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setSelectedFile(null);
    setShowReceiptUpload(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let receiptUrl = '';
    if (selectedFile) {
      receiptUrl = URL.createObjectURL(selectedFile);
    }
    
    addTransaction({
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      type: 'income',
      date: formData.date,
      receiptUrl,
      receiptFile: selectedFile || undefined
    });
    
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedFile(null);
    setShowForm(false);
  };

  const handleBulkImport = (data: any[]) => {
    data.forEach(row => {
      addTransaction({
        amount: parseFloat(row.amount.toString()),
        description: row.description || '',
        category: row.category || 'Other',
        type: 'income',
        date: row.date || new Date().toISOString().split('T')[0]
      });
    });
  };

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  const incomeByCategory = incomeTransactions.reduce((acc, income) => {
    acc[income.category] = (acc[income.category] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Advertisements':
        return <Megaphone className="h-5 w-5" />;
      case 'Powerbank Sales':
      case 'Powerbank Rentals':
        return <Battery className="h-5 w-5" />;
      case 'Events':
        return <Calendar className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
        <div className="flex space-x-3">
          <div className="relative group">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={() => exportTransactionsToPDF(incomeTransactions, 'Income Report')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as PDF
              </button>
              <button
                onClick={() => exportTransactionsToExcel(incomeTransactions, 'Income Report', 'income_report')}
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
            Add Income
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <ExcelImport
          onImport={handleBulkImport}
          onClose={() => setShowImport(false)}
          templateColumns={['date', 'category', 'description', 'amount']}
          title="Income Data"
          sampleData={[
            {
              date: '2024-01-15',
              category: 'Advertisements',
              description: 'Digital advertising revenue',
              amount: 15000
            },
            {
              date: '2024-01-16',
              category: 'Powerbank Sales',
              description: 'Powerbank unit sales',
              amount: 8500
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
                    id="receipt-upload-modal"
                    required
                  />
                  <label
                    htmlFor="receipt-upload-modal"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Megaphone className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Advertisements</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(incomeByCategory['Advertisements'] || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Battery className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Powerbank Sales</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(incomeByCategory['Powerbank Sales'] || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Battery className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Powerbank Rentals</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(incomeByCategory['Powerbank Rentals'] || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Income Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Income</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Income Source
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select income source</option>
                  {incomeCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
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
                placeholder="Enter income description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt/Invoice Attachment (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="income-receipt-upload"
                />
                <label
                  htmlFor="income-receipt-upload"
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
                Add Income
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

      {/* Income by Category */}
      {Object.keys(incomeByCategory).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Income by Source</h2>
          <div className="space-y-3">
            {Object.entries(incomeByCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-3">
                      {getCategoryIcon(category)}
                    </div>
                    <span className="font-medium text-gray-900">{category}</span>
                  </div>
                  <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Income List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Income</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
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
              {incomeTransactions.length > 0 ? (
                incomeTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((income) => (
                    <tr key={income.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(income.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="mr-1">{getCategoryIcon(income.category)}</span>
                          {income.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {income.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(income.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {income.receiptUrl ? (
                          <a
                            href={income.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Paperclip className="h-4 w-4 mr-1" />
                            View
                          </a>
                        ) : (
                          <button
                            onClick={() => openReceiptUpload(income.id)}
                            className="text-green-600 hover:text-green-800 flex items-center text-sm"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Add Receipt
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {income.receiptUrl && (
                            <button
                              onClick={() => openReceiptUpload(income.id)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Update receipt"
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(income.id)}
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
                    No income recorded yet. Add your first income entry to get started.
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

export default Income;