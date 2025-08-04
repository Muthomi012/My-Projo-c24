import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          category: string
          date: string
          type: string
          receipt_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          category: string
          date: string
          type: string
          receipt_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          category?: string
          date?: string
          type?: string
          receipt_url?: string
          created_at?: string
        }
      }
      petty_cash_entries: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          type: string
          date: string
          receipt_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          type: string
          date: string
          receipt_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          type?: string
          date?: string
          receipt_url?: string
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          budgeted_amount: number
          period: string
          start_date: string
          end_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          budgeted_amount: number
          period: string
          start_date: string
          end_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          budgeted_amount?: number
          period?: string
          start_date?: string
          end_date?: string
          created_at?: string
        }
      }
      balance_sheet_items: {
        Row: {
          id: string
          user_id: string
          category: string
          subcategory: string
          amount: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          subcategory: string
          amount: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          subcategory?: string
          amount?: number
          date?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          created_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          balance: number
          account_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          balance: number
          account_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          balance?: number
          account_type?: string
          created_at?: string
        }
      }
    }
  }
}