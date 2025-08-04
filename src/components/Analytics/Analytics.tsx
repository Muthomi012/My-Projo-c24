import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar,
  Target,
  DollarSign,
  Activity,
  Users,
  Zap,
  Download,
  FileText,
  Filter
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const Analytics: React.FC = () => {
  const { transactions, pettyCashEntries, budgets } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filter data based on selected period
  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (selectedPeriod) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current-quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
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

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const withinDateRange = transactionDate >= startDate && transactionDate <= endDate;
      const withinCategory = selectedCategory === 'all' || t.category === selectedCategory;
      return withinDateRange && withinCategory;
    });

    return { filteredTransactions, startDate, endDate };
  };

  const { filteredTransactions } = getFilteredData();

  // Analytics calculations
  const analytics = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income');
    const expenses = filteredTransactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Revenue by category
    const revenueByCategory = income.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Expenses by category
    const expensesByCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends
    const monthlyData = filteredTransactions.reduce((acc, t) => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expenses += t.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    // Top performing categories
    const topRevenueCategories = Object.entries(revenueByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const topExpenseCategories = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Transaction frequency
    const transactionFrequency = filteredTransactions.length;
    const averageTransactionValue = transactionFrequency > 0 ? 
      (totalIncome + totalExpenses) / transactionFrequency : 0;

    // Growth calculations (comparing with previous period)
    const previousPeriodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const periodLength = new Date().getTime() - new Date(selectedPeriod === 'current-month' ? 
        new Date().getFullYear() + '-' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '-01' : 
        new Date().getFullYear() + '-01-01').getTime();
      const previousStart = new Date(new Date().getTime() - (2 * periodLength));
      const previousEnd = new Date(new Date().getTime() - periodLength);
      return transactionDate >= previousStart && transactionDate <= previousEnd;
    });

    const previousIncome = previousPeriodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const incomeGrowth = previousIncome > 0 ? 
      ((totalIncome - previousIncome) / previousIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      revenueByCategory,
      expensesByCategory,
      monthlyData,
      topRevenueCategories,
      topExpenseCategories,
      transactionFrequency,
      averageTransactionValue,
      incomeGrowth
    };
  }, [filteredTransactions, selectedPeriod]);

  // Get all unique categories for filter
  const allCategories = [...new Set(transactions.map(t => t.category))];

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'current-month': return 'Current Month';
      case 'last-month': return 'Last Month';
      case 'current-quarter': return 'Current Quarter';
      case 'current-year': return 'Current Year';
      case 'last-year': return 'Last Year';
      case 'custom': return `${customStartDate} to ${customEndDate}`;
      default: return 'Current Month';
    }
  };

  const exportAnalyticsToPDF = () => {
    const data = [
      { metric: 'Total Income', value: formatCurrency(analytics.totalIncome) },
      { metric: 'Total Expenses', value: formatCurrency(analytics.totalExpenses) },
      { metric: 'Net Profit', value: formatCurrency(analytics.netProfit) },
      { metric: 'Profit Margin', value: `${analytics.profitMargin.toFixed(2)}%` },
      { metric: 'Transaction Count', value: analytics.transactionFrequency.toString() },
      { metric: 'Average Transaction Value', value: formatCurrency(analytics.averageTransactionValue) },
      { metric: 'Income Growth', value: `${analytics.incomeGrowth.toFixed(2)}%` }
    ];

    exportToPDF(
      `Business Analytics Report - ${getPeriodLabel()}`,
      data,
      ['metric', 'value'],
      ['Metric', 'Value']
    );
  };

  const exportAnalyticsToExcel = () => {
    const data = [
      { Metric: 'Total Income', Value: analytics.totalIncome },
      { Metric: 'Total Expenses', Value: analytics.totalExpenses },
      { Metric: 'Net Profit', Value: analytics.netProfit },
      { Metric: 'Profit Margin (%)', Value: analytics.profitMargin },
      { Metric: 'Transaction Count', Value: analytics.transactionFrequency },
      { Metric: 'Average Transaction Value', Value: analytics.averageTransactionValue },
      { Metric: 'Income Growth (%)', Value: analytics.incomeGrowth }
    ];

    exportToExcel(`Business Analytics Report - ${getPeriodLabel()}`, data, 'business_analytics');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Business Intelligence & Analytics</h1>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={exportAnalyticsToPDF}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as PDF
              </button>
              <button
                onClick={exportAnalyticsToExcel}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value="current-month">Current Month</option>
              <option value="last-month">Last Month</option>
              <option value="current-quarter">Current Quarter</option>
              <option value="current-year">Current Year</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Period</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Categories</option>
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {selectedPeriod === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
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
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalIncome)}</p>
              <p className="text-xs text-gray-400">
                {analytics.incomeGrowth >= 0 ? '+' : ''}{analytics.incomeGrowth.toFixed(1)}% vs previous period
              </p>
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
              <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.totalExpenses)}</p>
              <p className="text-xs text-gray-400">
                {analytics.totalIncome > 0 ? `${((analytics.totalExpenses / analytics.totalIncome) * 100).toFixed(1)}% of revenue` : '0% of revenue'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className={`${analytics.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              <DollarSign className={`h-6 w-6 ${analytics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Profit</p>
              <p className={`text-2xl font-bold ${analytics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(analytics.netProfit)}
              </p>
              <p className="text-xs text-gray-400">
                {analytics.profitMargin.toFixed(1)}% profit margin
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.transactionFrequency}</p>
              <p className="text-xs text-gray-400">
                Avg: {formatCurrency(analytics.averageTransactionValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-green-600" />
            Revenue by Category
          </h3>
          <div className="space-y-3">
            {analytics.topRevenueCategories.map(([category, amount], index) => {
              const percentage = analytics.totalIncome > 0 ? (amount / analytics.totalIncome) * 100 : 0;
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-4 h-4 rounded mr-3`}
                      style={{ backgroundColor: `hsl(${index * 72}, 70%, 50%)` }}
                    ></div>
                    <span className="text-sm text-gray-700">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
                    <div className="text-xs text-gray-400">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-red-600" />
            Expenses by Category
          </h3>
          <div className="space-y-3">
            {analytics.topExpenseCategories.map(([category, amount], index) => {
              const percentage = analytics.totalExpenses > 0 ? (amount / analytics.totalExpenses) * 100 : 0;
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-4 h-4 rounded mr-3`}
                      style={{ backgroundColor: `hsl(${index * 72 + 180}, 70%, 50%)` }}
                    ></div>
                    <span className="text-sm text-gray-700">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-red-600">{formatCurrency(amount)}</span>
                    <div className="text-xs text-gray-400">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      {Object.keys(analytics.monthlyData).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Monthly Trends
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Income</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Net Profit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(analytics.monthlyData)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, data]) => {
                    const netProfit = data.income - data.expenses;
                    const margin = data.income > 0 ? (netProfit / data.income) * 100 : 0;
                    return (
                      <tr key={month}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-green-600">
                          {formatCurrency(data.income)}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-red-600">
                          {formatCurrency(data.expenses)}
                        </td>
                        <td className={`px-4 py-2 text-sm font-medium ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(netProfit)}
                        </td>
                        <td className={`px-4 py-2 text-sm ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {margin.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Business Insights */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Zap className="h-6 w-6 mr-2" />
          Business Insights for {getPeriodLabel()}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-green-500 bg-opacity-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Performance</h4>
            <p className="text-green-100 text-sm">
              {analytics.profitMargin > 20 ? 'Excellent' : 
               analytics.profitMargin > 10 ? 'Good' : 
               analytics.profitMargin > 0 ? 'Fair' : 'Needs Improvement'} profit margin of {analytics.profitMargin.toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-green-500 bg-opacity-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Top Revenue Source</h4>
            <p className="text-green-100 text-sm">
              {analytics.topRevenueCategories[0] ? 
                `${analytics.topRevenueCategories[0][0]} (${formatCurrency(analytics.topRevenueCategories[0][1])})` : 
                'No revenue recorded'}
            </p>
          </div>
          
          <div className="bg-green-500 bg-opacity-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Growth Trend</h4>
            <p className="text-green-100 text-sm">
              {analytics.incomeGrowth > 0 ? 
                `Growing by ${analytics.incomeGrowth.toFixed(1)}%` : 
                analytics.incomeGrowth < 0 ? 
                `Declining by ${Math.abs(analytics.incomeGrowth).toFixed(1)}%` : 
                'Stable performance'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;