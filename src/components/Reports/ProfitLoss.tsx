import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, getCurrentMonth, getCurrentYear } from '../../utils/formatters';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Download, FileText } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const ProfitLoss: React.FC = () => {
  const { transactions } = useData();
  const [period, setPeriod] = useState('current-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'custom':
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const income = filteredTransactions.filter(t => t.type === 'income');
  const expenses = filteredTransactions.filter(t => t.type === 'expense');

  // Revenue breakdown
  const revenueByCategory = income.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Expense breakdown
  const expensesByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const grossProfit = totalRevenue;
  const netProfit = totalRevenue - totalExpenses;

  const getPeriodLabel = () => {
    switch (period) {
      case 'current-month':
        return 'Current Month';
      case 'last-month':
        return 'Last Month';
      case 'current-year':
        return 'Current Year';
      case 'last-year':
        return 'Last Year';
      case 'custom':
        return `${customStartDate} to ${customEndDate}`;
      default:
        return 'Current Month';
    }
  };

  const exportProfitLossToPDF = () => {
    const data = [
      ...Object.entries(revenueByCategory).map(([category, amount]) => ({
        category: `Revenue - ${category}`,
        amount: formatCurrency(amount)
      })),
      { category: 'Total Revenue', amount: formatCurrency(totalRevenue) },
      { category: '', amount: '' },
      ...Object.entries(expensesByCategory).map(([category, amount]) => ({
        category: `Expense - ${category}`,
        amount: formatCurrency(amount)
      })),
      { category: 'Total Expenses', amount: formatCurrency(totalExpenses) },
      { category: '', amount: '' },
      { category: 'Net Profit (Loss)', amount: formatCurrency(netProfit) }
    ];

    exportToPDF(
      `Profit & Loss Statement - ${getPeriodLabel()}`,
      data,
      ['category', 'amount'],
      ['Category', 'Amount']
    );
  };

  const exportProfitLossToExcel = () => {
    const data = [
      ...Object.entries(revenueByCategory).map(([category, amount]) => ({
        Category: `Revenue - ${category}`,
        Amount: amount
      })),
      { Category: 'Total Revenue', Amount: totalRevenue },
      { Category: '', Amount: '' },
      ...Object.entries(expensesByCategory).map(([category, amount]) => ({
        Category: `Expense - ${category}`,
        Amount: amount
      })),
      { Category: 'Total Expenses', Amount: totalExpenses },
      { Category: '', Amount: '' },
      { Category: 'Net Profit (Loss)', Amount: netProfit }
    ];

    exportToExcel(`Profit & Loss Statement - ${getPeriodLabel()}`, data, 'profit_loss_statement');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Profit & Loss Statement</h1>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={exportProfitLossToPDF}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as PDF
              </button>
              <button
                onClick={exportProfitLossToExcel}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as Excel
              </button>
            </div>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="current-year">Current Year</option>
            <option value="last-year">Last Year</option>
            <option value="custom">Custom Period</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {period === 'custom' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
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
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gross Profit</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(grossProfit)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className={`${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              <DollarSign className={`h-6 w-6 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
          <h2 className="text-xl font-bold">Charge24 Limited - Profit & Loss Statement</h2>
          <p className="text-green-100">Period: {getPeriodLabel()}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Revenue Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Revenue
            </h3>
            <div className="space-y-2">
              {Object.entries(revenueByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 font-semibold">
                <span className="text-gray-900">Total Revenue</span>
                <span className="text-green-600 text-lg">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Gross Profit</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(grossProfit)}</span>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
              Operating Expenses
            </h3>
            <div className="space-y-2">
              {Object.keys(expensesByCategory).length > 0 ? (
                Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">{category}</span>
                    <span className="font-medium text-red-600">{formatCurrency(amount)}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4">No expenses recorded for this period</div>
              )}
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 font-semibold">
                <span className="text-gray-900">Total Operating Expenses</span>
                <span className="text-red-600 text-lg">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className={`${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'} p-6 rounded-lg`}>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Net Profit (Loss)</span>
              <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
            {netProfit < 0 && (
              <p className="text-red-600 text-sm mt-2">
                * Loss shown in parentheses indicates expenses exceeded revenue for this period
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      {totalRevenue > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Profit Margin</p>
              <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {((netProfit / totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Expense Ratio</p>
              <p className="text-xl font-bold text-blue-600">
                {((totalExpenses / totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Revenue Growth</p>
              <p className="text-xl font-bold text-purple-600">
                {totalRevenue > 0 ? '+' : ''}{formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLoss;