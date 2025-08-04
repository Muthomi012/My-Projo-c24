export interface Transaction {
  id: string;
  userId: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense' | 'petty-cash';
  receiptUrl?: string;
  receiptFile?: File;
}

export interface PettyCashEntry {
  id: string;
  userId: string;
  date: string;
  amount: number;
  description: string;
  type: 'add' | 'withdraw';
  receiptUrl?: string;
  receiptFile?: File;
}

export interface BalanceSheetItem {
  id: string;
  category: 'assets' | 'liabilities' | 'equity';
  subcategory: string;
  amount: number;
  date: string;
}

export interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pettyCashBalance: number;
  monthlyIncome: number[];
  monthlyExpenses: number[];
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  budgetedAmount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
}