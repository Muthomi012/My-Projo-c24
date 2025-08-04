import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Trash2, Target, TrendingUp, TrendingDown, AlertTriangle, Download, FileText, Minus, Upload, Paperclip, FileSpreadsheet } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import ExcelImport from '../Import/ExcelImport';

const budgetCategories = [
  'Sales Department',
  'Immersions',
  'Locations Department',
  'Media Department',
  'Operations Department',
  'Finance Department',
  'IT Department',
  'Executive/Admin Department',
  'Brand Ambassadors Department',
  'Events Department',
  'Miscellaneous'
];

const Budgets: React.FC = () => {
  const { budgets, transactions, addBudget, deleteBudget, addTransaction } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    budgetedAmount: '',
    period: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [expenditureData, setExpenditureData] = useState({
    budgetId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Calculate end date based on period
  const calculateEndDate = (startDate: string, period: string) => {
    const start = new Date(startDate);
    let end = new Date(start);
    
    switch (period) {
      case 'monthly':
        end.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(start.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1);
        break;
    }
    
    return end.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const endDate = formData.endDate || calculateEndDate(formData.startDate, formData.period);
    
    addBudget({
      category: formData.category,
      budgetedAmount: parseFloat(formData.budgetedAmount),
      period: formData.period,
      startDate: formData.startDate,
      endDate: endDate
    });
    
    setFormData({
      category: '',
      budgetedAmount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setShowForm(false);
  };

  const handleExpenditureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedBudget = budgets.find(b => b.id === expenditureData.budgetId);
    if (!selectedBudget) return;
    
    let receiptUrl = '';
    if (selectedFile) {
      receiptUrl = URL.createObjectURL(selectedFile);
    }
    
    // Add as an expense transaction
    addTransaction({
      amount: parseFloat(expenditureData.amount),
      description: `${expenditureData.description} (Budget: ${selectedBudget.category})`,
      category: selectedBudget.category,
      type: 'expense',
      date: expenditureData.date,
      receiptUrl,
      receiptFile: selectedFile || undefined
    });
    
    setExpenditureData({
      budgetId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedFile(null);
    setShowExpenditureForm(false);
  };

  const handleBulkImport = (data: any[]) => {
    data.forEach(row => {
      addBudget({
        category: row.category || 'Miscellaneous',
        budgetedAmount: parseFloat(row.budgetedAmount.toString()),
        period: row.period || 'monthly',
        startDate: row.startDate || new Date().toISOString().split('T')[0],
        endDate: row.endDate || calculateEndDate(row.startDate || new Date().toISOString().split('T')[0], row.period || 'monthly')
      });
    });
  };

  // Calculate actual expenditure for each budget
  const getBudgetAnalysis = () => {
    return budgets.map(budget => {
      const actualExpenses = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === budget.category &&
          new Date(t.date) >= new Date(budget.startDate) &&
          new Date(t.date) <= new Date(budget.endDate)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      const variance = budget.budgetedAmount - actualExpenses;
      const percentageUsed = budget.budgetedAmount > 0 ? (actualExpenses / budget.budgetedAmount) * 100 : 0;
      
      return {
        ...budget,
        actualExpenses,
        variance,
        percentageUsed,
        status: variance >= 0 ? 'within' : 'over'
      };
    });
  };

  const budgetAnalysis = getBudgetAnalysis();
  
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgetedAmount, 0);
  const totalActual = budgetAnalysis.reduce((sum, b) => sum + b.actualExpenses, 0);
  const totalVariance = totalBudgeted - totalActual;

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
    }
  };

  const exportBudgetToPDF = () => {
    const data = budgetAnalysis.map(budget => ({
      category: budget.category,
      period: budget.period,
      budgeted: formatCurrency(budget.budgetedAmount),
      actual: formatCurrency(budget.actualExpenses),
      variance: formatCurrency(budget.variance),
      status: budget.status === 'within' ? 'Within Budget' : 'Over Budget'
    }));

    exportToPDF(
      'Budget Analysis Report',
      data,
      ['category', 'period', 'budgeted', 'actual', 'variance', 'status'],
      ['Category', 'Period', 'Budgeted', 'Actual', 'Variance', 'Status']
    );
  };

  const exportBudgetToExcel = () => {
    const data = budgetAnalysis.map(budget => ({
      Category: budget.category,
      Period: budget.period,
      'Start Date': formatDate(budget.startDate),
      'End Date': formatDate(budget.endDate),
      'Budgeted Amount': budget.budgetedAmount,
      'Actual Expenses': budget.actualExpenses,
      'Variance': budget.variance,
      'Percentage Used': `${budget.percentageUsed.toFixed(1)}%`,
      'Status': budget.status === 'within' ? 'Within Budget' : 'Over Budget'
    }));

    exportToExcel('Budget Analysis Report', data, 'budget_analysis');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
        <div className="flex space-x-3">
          <div className="relative group">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={exportBudgetToPDF}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as PDF
              </button>
              <button
                onClick={exportBudgetToExcel}
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
            Add Budget
          </button>
        </div>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={() => setShowExpenditureForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <Minus className="h-4 w-4 mr-2" />
          Add Expenditure
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Budgeted</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBudgeted)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Actual</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalActual)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className={`${totalVariance >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              <TrendingUp className={`h-6 w-6 ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Variance</p>
              <p className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalVariance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <ExcelImport
          onImport={handleBulkImport}
          onClose={() => setShowImport(false)}
          templateColumns={['category', 'budgetedAmount', 'period', 'startDate', 'endDate']}
          title="Budget Data"
          sampleData={[
            {
              category: 'Operations Department',
              budgetedAmount: 50000,
              period: 'monthly',
              startDate: '2024-01-01',
              endDate: '2024-01-31'
            },
            {
              category: 'IT Department',
              budgetedAmount: 30000,
              period: 'monthly',
              startDate: '2024-01-01',
              endDate: '2024-01-31'
            }
          ]}
        />
      )}

      {/* Add Budget Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Budget</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a category</option>
                  {budgetCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budgeted Amount (KES)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budgetedAmount}
                  onChange={(e) => setFormData({ ...formData, budgetedAmount: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                Add Budget
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

      {/* Add Expenditure Form */}
      {showExpenditureForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Budget Expenditure</h2>
          <form onSubmit={handleExpenditureSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Budget
                </label>
                <select
                  value={expenditureData.budgetId}
                  onChange={(e) => setExpenditureData({ ...expenditureData, budgetId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a budget</option>
                  {budgets.map(budget => (
                    <option key={budget.id} value={budget.id}>
                      {budget.category} - {formatCurrency(budget.budgetedAmount)} ({budget.period})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={expenditureData.date}
                  onChange={(e) => setExpenditureData({ ...expenditureData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expenditure Amount (KES)
              </label>
              <input
                type="number"
                step="0.01"
                value={expenditureData.amount}
                onChange={(e) => setExpenditureData({ ...expenditureData, amount: e.target.value })}
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
                value={expenditureData.description}
                onChange={(e) => setExpenditureData({ ...expenditureData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder="Enter expenditure description"
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
                  id="expenditure-receipt-upload"
                />
                <label
                  htmlFor="expenditure-receipt-upload"
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
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Add Expenditure
              </button>
              <button
                type="button"
                onClick={() => setShowExpenditureForm(false)}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Analysis Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Budget vs Actual Analysis</h2>
            <p className="text-sm text-gray-500">Expenditures automatically subtract from budgeted amounts</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budgeted Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Expenditure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetAnalysis.length > 0 ? (
                budgetAnalysis.map((budget) => (
                  <tr key={budget.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {budget.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="capitalize">{budget.period}</span>
                      <div className="text-xs text-gray-400">
                        {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatCurrency(budget.budgetedAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {formatCurrency(budget.actualExpenses)}
                      <div className="text-xs text-gray-400">
                        {budget.percentageUsed.toFixed(1)}% used
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={budget.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(budget.variance)}
                      </span>
                      <div className="text-xs text-gray-400">
                        {budget.budgetedAmount > 0 ? `${((budget.variance / budget.budgetedAmount) * 100).toFixed(1)}% remaining` : '0% remaining'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        budget.status === 'within' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {budget.status === 'within' ? (
                          <Target className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {budget.status === 'within' ? 'Within Budget' : 'Over Budget'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBudgetId(budget.id);
                            setExpenditureData({ ...expenditureData, budgetId: budget.id });
                            setShowExpenditureForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Add expenditure to this budget"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
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
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No budgets created yet. Add your first budget to start tracking expenses.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Budget Expenditures */}
      {budgetAnalysis.some(b => b.actualExpenses > 0) && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Budget Expenditures</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget Category
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions
                  .filter(t => t.type === 'expense' && budgetCategories.includes(t.category))
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        -{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.receiptUrl ? (
                          <a
                            href={transaction.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Paperclip className="h-4 w-4 mr-1" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">No receipt</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;