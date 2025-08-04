import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Transaction, PettyCashEntry, BalanceSheetItem, Budget } from '../types';

interface DataContextType {
  transactions: Transaction[];
  pettyCashEntries: PettyCashEntry[];
  balanceSheetItems: BalanceSheetItem[];
  budgets: Budget[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  addPettyCashEntry: (entry: Omit<PettyCashEntry, 'id' | 'userId'>) => Promise<void>;
  addBalanceSheetItem: (item: Omit<BalanceSheetItem, 'id'>) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Transaction) => Promise<void>;
  updatePettyCashEntry: (id: string, entry: PettyCashEntry) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deletePettyCashEntry: (id: string) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  migrateLocalStorageData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pettyCashEntries, setPettyCashEntries] = useState<PettyCashEntry[]>([]);
  const [balanceSheetItems, setBalanceSheetItems] = useState<BalanceSheetItem[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setTransactions([]);
      setPettyCashEntries([]);
      setBalanceSheetItems([]);
      setBudgets([]);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadTransactions(),
        loadPettyCashEntries(),
        loadBalanceSheetItems(),
        loadBudgets(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading transactions:', error);
      return;
    }

    const formattedTransactions: Transaction[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      amount: parseFloat(item.amount),
      description: item.description,
      category: item.category,
      date: item.date,
      type: item.type as 'income' | 'expense',
      receiptUrl: item.receipt_url,
    }));

    setTransactions(formattedTransactions);
  };

  const loadPettyCashEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('petty_cash_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading petty cash entries:', error);
      return;
    }

    const formattedEntries: PettyCashEntry[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      amount: parseFloat(item.amount),
      description: item.description,
      type: item.type as 'add' | 'withdraw',
      date: item.date,
      receiptUrl: item.receipt_url,
    }));

    setPettyCashEntries(formattedEntries);
  };

  const loadBalanceSheetItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('balance_sheet_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading balance sheet items:', error);
      return;
    }

    const formattedItems: BalanceSheetItem[] = data.map(item => ({
      id: item.id,
      category: item.category as 'assets' | 'liabilities' | 'equity',
      subcategory: item.subcategory,
      amount: parseFloat(item.amount),
      date: item.date,
    }));

    setBalanceSheetItems(formattedItems);
  };

  const loadBudgets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading budgets:', error);
      return;
    }

    const formattedBudgets: Budget[] = data.map(item => ({
      id: item.id,
      userId: item.user_id,
      category: item.category,
      budgetedAmount: parseFloat(item.budgeted_amount),
      period: item.period as 'monthly' | 'quarterly' | 'yearly',
      startDate: item.start_date,
      endDate: item.end_date,
    }));

    setBudgets(formattedBudgets);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
        receipt_url: transaction.receiptUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    const newTransaction: Transaction = {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      description: data.description,
      category: data.category,
      date: data.date,
      type: data.type,
      receiptUrl: data.receipt_url,
    };

    setTransactions(prev => [newTransaction, ...prev]);
  };

  const addPettyCashEntry = async (entry: Omit<PettyCashEntry, 'id' | 'userId'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('petty_cash_entries')
      .insert({
        user_id: user.id,
        amount: entry.amount,
        description: entry.description,
        type: entry.type,
        date: entry.date,
        receipt_url: entry.receiptUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding petty cash entry:', error);
      throw error;
    }

    const newEntry: PettyCashEntry = {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      description: data.description,
      type: data.type,
      date: data.date,
      receiptUrl: data.receipt_url,
    };

    setPettyCashEntries(prev => [newEntry, ...prev]);
  };

  const addBalanceSheetItem = async (item: Omit<BalanceSheetItem, 'id'>) => {
    if (!user) {
      // Store in localStorage when no user
      const newItem: BalanceSheetItem = {
        id: Date.now().toString(),
        ...item
      };
      
      const existing = JSON.parse(localStorage.getItem('charge24_balance_sheet_local') || '[]');
      existing.unshift(newItem);
      localStorage.setItem('charge24_balance_sheet_local', JSON.stringify(existing));
      setBalanceSheetItems(prev => [newItem, ...prev]);
      return;
    }

    const { data, error } = await supabase
      .from('balance_sheet_items')
      .insert({
        user_id: user.id,
        category: item.category,
        subcategory: item.subcategory,
        amount: item.amount,
        date: item.date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding balance sheet item:', error);
      throw error;
    }

    const newItem: BalanceSheetItem = {
      id: data.id,
      category: data.category,
      subcategory: data.subcategory,
      amount: parseFloat(data.amount),
      date: data.date,
    };

    setBalanceSheetItems(prev => [newItem, ...prev]);
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'userId'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category: budget.category,
        budgeted_amount: budget.budgetedAmount,
        period: budget.period,
        start_date: budget.startDate,
        end_date: budget.endDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding budget:', error);
      throw error;
    }

    const newBudget: Budget = {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      budgetedAmount: parseFloat(data.budgeted_amount),
      period: data.period,
      startDate: data.start_date,
      endDate: data.end_date,
    };

    setBudgets(prev => [newBudget, ...prev]);
  };

  const updateTransaction = async (id: string, transaction: Transaction) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .update({
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
        receipt_url: transaction.receiptUrl,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    setTransactions(prev => prev.map(t => t.id === id ? transaction : t));
  };

  const updatePettyCashEntry = async (id: string, entry: PettyCashEntry) => {
    if (!user) return;

    const { error } = await supabase
      .from('petty_cash_entries')
      .update({
        amount: entry.amount,
        description: entry.description,
        type: entry.type,
        date: entry.date,
        receipt_url: entry.receiptUrl,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating petty cash entry:', error);
      throw error;
    }

    setPettyCashEntries(prev => prev.map(e => e.id === id ? entry : e));
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const deletePettyCashEntry = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('petty_cash_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting petty cash entry:', error);
      throw error;
    }

    setPettyCashEntries(prev => prev.filter(e => e.id !== id));
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }

    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const migrateLocalStorageData = async () => {
    if (!user) return;

    try {
      // Check if migration has already been done
      const migrationKey = `charge24_migrated_${user.id}`;
      if (localStorage.getItem(migrationKey)) {
        return;
      }

      // Migrate transactions
      const localTransactions = JSON.parse(localStorage.getItem(`charge24_transactions_${user.id}`) || '[]');
      for (const transaction of localTransactions) {
        await addTransaction({
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          date: transaction.date,
          type: transaction.type,
          receiptUrl: transaction.receiptUrl,
        });
      }

      // Migrate petty cash entries
      const localPettyCash = JSON.parse(localStorage.getItem(`charge24_petty_cash_${user.id}`) || '[]');
      for (const entry of localPettyCash) {
        await addPettyCashEntry({
          amount: entry.amount,
          description: entry.description,
          type: entry.type,
          date: entry.date,
          receiptUrl: entry.receiptUrl,
        });
      }

      // Migrate budgets
      const localBudgets = JSON.parse(localStorage.getItem(`charge24_budgets_${user.id}`) || '[]');
      for (const budget of localBudgets) {
        await addBudget({
          category: budget.category,
          budgetedAmount: budget.budgetedAmount,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate,
        });
      }

      // Migrate balance sheet items
      const localBalanceSheet = JSON.parse(localStorage.getItem(`charge24_balance_sheet_${user.id}`) || '[]');
      for (const item of localBalanceSheet) {
        await addBalanceSheetItem({
          category: item.category,
          subcategory: item.subcategory,
          amount: item.amount,
          date: item.date,
        });
      }

      // Mark migration as complete
      localStorage.setItem(migrationKey, 'true');
      console.log('Data migration completed successfully');
    } catch (error) {
      console.error('Error during data migration:', error);
    }
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        pettyCashEntries,
        balanceSheetItems,
        budgets,
        loading,
        addTransaction,
        addPettyCashEntry,
        addBalanceSheetItem,
        addBudget,
        updateTransaction,
        updatePettyCashEntry,
        deleteTransaction,
        deletePettyCashEntry,
        deleteBudget,
        migrateLocalStorageData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};