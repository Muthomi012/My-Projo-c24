import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FileText, Plus, Building, CreditCard, PiggyBank, Download, FileSpreadsheet } from 'lucide-react';
import { exportBalanceSheetToPDF, exportBalanceSheetToExcel } from '../../utils/exportUtils';
import ExcelImport from '../Import/ExcelImport';

const BalanceSheet: React.FC = () => {
  const { balanceSheetItems, addBalanceSheetItem } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [formData, setFormData] = useState({
    category: 'assets' as 'assets' | 'liabilities' | 'equity',
    subcategory: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = {
    assets: {
      icon: Building,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subcategories: [
        'Cash and Cash Equivalents',
        'Accounts Receivable',
        'Inventory',
        'Equipment',
        'Powerbank Machines',
        'Software',
        'Other Current Assets',
        'Other Fixed Assets'
      ]
    },
    liabilities: {
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      subcategories: [
        'Accounts Payable',
        'Short-term Loans',
        'Accrued Expenses',
        'Long-term Debt',
        'Other Liabilities'
      ]
    },
    equity: {
      icon: PiggyBank,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subcategories: [
        'Share Capital',
        'Retained Earnings',
        'Additional Paid-in Capital',
        'Other Equity'
      ]
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBalanceSheetItem({
      category: formData.category,
      subcategory: formData.subcategory,
      amount: parseFloat(formData.amount),
      date: formData.date
    });
    setFormData({
      category: 'assets',
      subcategory: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const handleBulkImport = (data: any[]) => {
    data.forEach(row => {
      addBalanceSheetItem({
        category: row.category as 'assets' | 'liabilities' | 'equity',
        subcategory: row.subcategory || '',
        amount: parseFloat(row.amount.toString()),
        date: row.date || new Date().toISOString().split('T')[0]
      });
    });
  };

  const getItemsByCategory = (category: 'assets' | 'liabilities' | 'equity') => {
    return balanceSheetItems
      .filter(item => item.category === category)
      .reduce((acc, item) => {
        acc[item.subcategory] = (acc[item.subcategory] || 0) + item.amount;
        return acc;
      }, {} as Record<string, number>);
  };

  const assets = getItemsByCategory('assets');
  const liabilities = getItemsByCategory('liabilities');
  const equity = getItemsByCategory('equity');

  const totalAssets = Object.values(assets).reduce((sum, amount) => sum + amount, 0);
  const totalLiabilities = Object.values(liabilities).reduce((sum, amount) => sum + amount, 0);
  const totalEquity = Object.values(equity).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Balance Sheet</h1>
        <div className="flex space-x-3">
          <div className="relative group">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={() => exportBalanceSheetToPDF(balanceSheetItems)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as PDF
              </button>
              <button
                onClick={() => exportBalanceSheetToExcel(balanceSheetItems)}
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
            Add Item
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          Charge24 Limited - Balance Sheet Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-green-200 text-sm">Total Assets</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAssets)}</p>
          </div>
          <div className="text-center">
            <p className="text-green-200 text-sm">Total Liabilities</p>
            <p className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</p>
          </div>
          <div className="text-center">
            <p className="text-green-200 text-sm">Total Equity</p>
            <p className="text-2xl font-bold">{formatCurrency(totalEquity)}</p>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Balance Sheet Item</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any, subcategory: '' })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="assets">Assets</option>
                  <option value="liabilities">Liabilities</option>
                  <option value="equity">Equity</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select subcategory</option>
                  {categories[formData.category].subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Item
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
          templateColumns={['category', 'subcategory', 'amount', 'date']}
          title="Balance Sheet Data"
          sampleData={[
            {
              category: 'assets',
              subcategory: 'Cash and Cash Equivalents',
              amount: 100000,
              date: '2024-01-01'
            },
            {
              category: 'assets',
              subcategory: 'Equipment',
              amount: 250000,
              date: '2024-01-01'
            }
          ]}
        />
      )}

      {/* Balance Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const categoryData = getItemsByCategory(categoryKey as any);
          const total = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);
          
          return (
            <div key={categoryKey} className="bg-white rounded-lg shadow-sm border">
              <div className={`${categoryInfo.bgColor} p-4 rounded-t-lg`}>
                <h3 className={`text-lg font-semibold ${categoryInfo.color} flex items-center capitalize`}>
                  <categoryInfo.icon className="h-5 w-5 mr-2" />
                  {categoryKey}
                </h3>
              </div>
              <div className="p-4">
                {Object.keys(categoryData).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(categoryData).map(([subcategory, amount]) => (
                      <div key={subcategory} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{subcategory}</span>
                        <span className={`font-medium ${categoryInfo.color}`}>
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total {categoryKey}</span>
                        <span className={`font-bold text-lg ${categoryInfo.color}`}>
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">
                    No {categoryKey} recorded yet
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Balance Check */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Assets = Liabilities + Equity</p>
            <p className="text-lg">
              <span className="font-semibold">{formatCurrency(totalAssets)}</span>
              <span className="mx-2">=</span>
              <span className="font-semibold">{formatCurrency(totalLiabilities + totalEquity)}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Balance Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              totalAssets === (totalLiabilities + totalEquity)
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {totalAssets === (totalLiabilities + totalEquity) ? 'Balanced' : 'Not Balanced'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;