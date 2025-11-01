import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          initial_cash: number;
          monthly_revenue: number;
          monthly_expenses: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          initial_cash?: number;
          monthly_revenue?: number;
          monthly_expenses?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          budget_id: string;
          name: string;
          engineers_count: number;
          engineer_salary: number;
          marketing_spend: number;
          price_increase_percent: number;
          calculated_runway: number;
          calculated_monthly_burn: number;
          calculated_profit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          budget_id: string;
          name?: string;
          engineers_count?: number;
          engineer_salary?: number;
          marketing_spend?: number;
          price_increase_percent?: number;
          calculated_runway?: number;
          calculated_monthly_burn?: number;
          calculated_profit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
