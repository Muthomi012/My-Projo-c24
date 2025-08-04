import React from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Wallet, BarChart3, Users } from 'lucide-react';
import DataBackup from '../Backup/DataBackup';

const Dashboard: React.FC = () => {
  const { transactions, pettyCashEntries } = useData();

  // Calculate metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pettyCashBalance = pettyCashEntries.reduce((balance, entry) => {
    return entry.type === 'add' ? balance + entry.amount : balance - entry.amount;
  }, 0);

  const netProfit = totalIncome - totalExpenses;

  // Recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Income breakdown
  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const metrics = [
    {
      name: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Net Profit',
      value: formatCurrency(netProfit),
      icon: DollarSign,
      color: netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      name: 'Petty Cash Balance',
      value: formatCurrency(pettyCashBalance),
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Data Backup Section - URGENT */}
      <DataBackup />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Charge24 Limited - Financial Overview
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`${metric.bgColor} p-3 rounded-lg`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                    <p className="text-xs text-gray-400">{transaction.date}</p>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>

        {/* Income Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Income Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(incomeByCategory).length > 0 ? (
              Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{category}</span>
                  </div>
                  <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No income recorded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Business Overview */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Charge24 Business Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Solar-Powered Solutions</h3>
            <p className="text-green-100 text-sm">Eco-friendly powerbank dispensing machines</p>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Advertising Platform</h3>
            <p className="text-green-100 text-sm">Digital advertising capabilities integrated</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Multiple Revenue Streams</h3>
            <p className="text-green-100 text-sm">Sales, rentals, advertising, and events</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;