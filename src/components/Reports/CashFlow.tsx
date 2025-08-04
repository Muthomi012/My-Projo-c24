import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Building, Download, FileText } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const CashFlow: React.FC = () => {
  const { transactions, pettyCashEntries } = useData();
  const [period, setPeriod] = useState('current-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getFilteredData = () => {
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
      case 'custom':
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    const filteredPettyCash = pettyCashEntries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    return { filteredTransactions, filteredPettyCash };
  };

  const { filteredTransactions, filteredPettyCash } = getFilteredData();

  // Operating Activities
  const operatingInflows = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const operatingOutflows = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netOperatingCashFlow = operatingInflows - operatingOutflows;

  // Investing Activities (simplified - could include equipment purchases, etc.)
  const investingInflows = 0; // Would include sale of equipment, investments, etc.
  const investingOutflows = 0; // Would include purchase of equipment, investments, etc.
  const netInvestingCashFlow = investingInflows - investingOutflows;

  // Financing Activities (simplified - could include loans, capital investments, etc.)
  const financingInflows = 0; // Would include loans received, capital investments, etc.
  const financingOutflows = 0; // Would include loan payments, dividends, etc.
  const netFinancingCashFlow = financingInflows - financingOutflows;

  // Petty Cash Changes
  const pettyCashInflows = filteredPettyCash
    .filter(e => e.type === 'add')
    .reduce((sum, e) => sum + e.amount, 0);

  const pettyCashOutflows = filteredPettyCash
    .filter(e => e.type === 'withdraw')
    .reduce((sum, e) => sum + e.amount, 0);

  const netPettyCashFlow = pettyCashInflows - pettyCashOutflows;

  // Total Net Cash Flow
  const totalNetCashFlow = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow + netPettyCashFlow;

  // Income breakdown for operating activities
  const incomeByCategory = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Expense breakdown for operating activities
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const getPeriodLabel = () => {
    switch (period) {
      case 'current-month':
        return 'Current Month';
      case 'last-month':
        return 'Last Month';
      case 'current-year':
        return 'Current Year';
      case 'custom':
        return `${customStartDate} to ${customEndDate}`;
      default:
        return 'Current Month';
    }
  };

  const exportCashFlowToPDF = () => {
    const data = [
      { category: 'OPERATING ACTIVITIES', amount: '' },
      ...Object.entries(incomeByCategory).map(([category, amount]) => ({
        category: `Cash from ${category}`,
        amount: formatCurrency(amount)
      })),
      { category: 'Total Operating Inflows', amount: formatCurrency(operatingInflows) },
      { category: '', amount: '' },
      ...Object.entries(expensesByCategory).map(([category, amount]) => ({
        category: `Cash for ${category}`,
        amount: `(${formatCurrency(amount)})`
      })),
      { category: 'Total Operating Outflows', amount: `(${formatCurrency(operatingOutflows)})` },
      { category: 'Net Operating Cash Flow', amount: formatCurrency(netOperatingCashFlow) },
      { category: '', amount: '' },
      { category: 'INVESTING ACTIVITIES', amount: '' },
      { category: 'Net Investing Cash Flow', amount: formatCurrency(netInvestingCashFlow) },
      { category: '', amount: '' },
      { category: 'FINANCING ACTIVITIES', amount: '' },
      { category: 'Net Financing Cash Flow', amount: formatCurrency(netFinancingCashFlow) },
      { category: '', amount: '' },
      { category: 'NET CASH FLOW', amount: formatCurrency(totalNetCashFlow) }
    ];

    exportToPDF(
      `Cash Flow Statement - ${getPeriodLabel()}`,
      data,
      ['category', 'amount'],
      ['Category', 'Amount']
    );
  };

  const exportCashFlowToExcel = () => {
    const data = [
      { Category: 'OPERATING ACTIVITIES', Amount: '' },
      ...Object.entries(incomeByCategory).map(([category, amount]) => ({
        Category: `Cash from ${category}`,
        Amount: amount
      })),
      { Category: 'Total Operating Inflows', Amount: operatingInflows },
      { Category: '', Amount: '' },
      ...Object.entries(expensesByCategory).map(([category, amount]) => ({
        Category: `Cash for ${category}`,
        Amount: -amount
      })),
      { Category: 'Total Operating Outflows', Amount: -operatingOutflows },
      { Category: 'Net Operating Cash Flow', Amount: netOperatingCashFlow },
      { Category: '', Amount: '' },
      { Category: 'INVESTING ACTIVITIES', Amount: '' },
      { Category: 'Net Investing Cash Flow', Amount: netInvestingCashFlow },
      { Category: '', Amount: '' },
      { Category: 'FINANCING ACTIVITIES', Amount: '' },
      { Category: 'Net Financing Cash Flow', Amount: netFinancingCashFlow },
      { Category: '', Amount: '' },
      { Category: 'NET CASH FLOW', Amount: totalNetCashFlow }
    ];

    exportToExcel(`Cash Flow Statement - ${getPeriodLabel()}`, data, 'cash_flow_statement');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Cash Flow Statement</h1>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={exportCashFlowToPDF}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Export as PDF
              </button>
              <button
                onClick={exportCashFlowToExcel}
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
            <div className={`${netOperatingCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              <ArrowUpCircle className={`h-6 w-6 ${netOperatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Operating Cash Flow</p>
              <p className={`text-xl font-bold ${netOperatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netOperatingCashFlow)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className={`${netInvestingCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              <Building className={`h-6 w-6 ${netInvestingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Investing Cash Flow</p>
              <p className={`text-xl font-bold ${netInvestingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netInvestingCashFlow)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className={`${netFinancingCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              <DollarSign className={`h-6 w-6 ${netFinancingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Financing Cash Flow</p>
              <p className={`text-xl font-bold ${netFinancingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netFinancingCashFlow)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className={`${totalNetCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              <ArrowDownCircle className={`h-6 w-6 ${totalNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Cash Flow</p>
              <p className={`text-xl font-bold ${totalNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalNetCashFlow)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Statement */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
          <h2 className="text-xl font-bold">Charge24 Limited - Cash Flow Statement</h2>
          <p className="text-green-100">Period: {getPeriodLabel()}</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Operating Activities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ArrowUpCircle className="h-5 w-5 mr-2 text-green-600" />
              Cash Flows from Operating Activities
            </h3>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Cash Inflows:</h4>
              {Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center py-1 ml-4">
                  <span className="text-gray-700">Cash received from {category}</span>
                  <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 ml-4 border-t border-gray-200 font-medium">
                <span className="text-gray-900">Total Operating Inflows</span>
                <span className="text-green-600">{formatCurrency(operatingInflows)}</span>
              </div>

              <h4 className="font-medium text-gray-800 mt-4">Cash Outflows:</h4>
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center py-1 ml-4">
                  <span className="text-gray-700">Cash paid for {category}</span>
                  <span className="font-medium text-red-600">({formatCurrency(amount)})</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 ml-4 border-t border-gray-200 font-medium">
                <span className="text-gray-900">Total Operating Outflows</span>
                <span className="text-red-600">({formatCurrency(operatingOutflows)})</span>
              </div>

              <div className={`flex justify-between items-center py-3 border-t-2 border-gray-300 font-bold ${
                netOperatingCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'
              } px-4 rounded`}>
                <span className="text-gray-900">Net Cash Flow from Operating Activities</span>
                <span className={netOperatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(netOperatingCashFlow)}
                </span>
              </div>
            </div>
          </div>

          {/* Investing Activities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-blue-600" />
              Cash Flows from Investing Activities
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 text-gray-500">
                <span>Purchase of equipment and machinery</span>
                <span>-</span>
              </div>
              <div className="flex justify-between items-center py-2 text-gray-500">
                <span>Sale of equipment</span>
                <span>-</span>
              </div>
              <div className={`flex justify-between items-center py-3 border-t-2 border-gray-300 font-bold ${
                netInvestingCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'
              } px-4 rounded`}>
                <span className="text-gray-900">Net Cash Flow from Investing Activities</span>
                <span className={netInvestingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(netInvestingCashFlow)}
                </span>
              </div>
            </div>
          </div>

          {/* Financing Activities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
              Cash Flows from Financing Activities
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 text-gray-500">
                <span>Proceeds from loans</span>
                <span>-</span>
              </div>
              <div className="flex justify-between items-center py-2 text-gray-500">
                <span>Loan repayments</span>
                <span>-</span>
              </div>
              <div className="flex justify-between items-center py-2 text-gray-500">
                <span>Owner capital contributions</span>
                <span>-</span>
              </div>
              <div className={`flex justify-between items-center py-3 border-t-2 border-gray-300 font-bold ${
                netFinancingCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'
              } px-4 rounded`}>
                <span className="text-gray-900">Net Cash Flow from Financing Activities</span>
                <span className={netFinancingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(netFinancingCashFlow)}
                </span>
              </div>
            </div>
          </div>

          {/* Petty Cash Activities */}
          {(pettyCashInflows > 0 || pettyCashOutflows > 0) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Petty Cash Activities</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Petty cash additions</span>
                  <span className="font-medium text-green-600">{formatCurrency(pettyCashInflows)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Petty cash withdrawals</span>
                  <span className="font-medium text-red-600">({formatCurrency(pettyCashOutflows)})</span>
                </div>
                <div className={`flex justify-between items-center py-3 border-t-2 border-gray-300 font-bold ${
                  netPettyCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'
                } px-4 rounded`}>
                  <span className="text-gray-900">Net Petty Cash Flow</span>
                  <span className={netPettyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(netPettyCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Total Net Cash Flow */}
          <div className={`p-6 rounded-lg ${
            totalNetCashFlow >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          } border-2`}>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Net Increase (Decrease) in Cash</span>
              <span className={`text-2xl font-bold ${totalNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalNetCashFlow)}
              </span>
            </div>
            {totalNetCashFlow < 0 && (
              <p className="text-red-600 text-sm mt-2">
                * Negative cash flow indicates more cash was spent than received during this period
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;