/*
  # CFO Helper Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - User identifier
      - `email` (text, unique) - User email
      - `created_at` (timestamptz) - Account creation timestamp
    
    - `budgets`
      - `id` (uuid, primary key) - Budget identifier
      - `user_id` (uuid, foreign key) - Owner of the budget
      - `name` (text) - Budget name
      - `initial_cash` (numeric) - Starting cash amount
      - `monthly_revenue` (numeric) - Expected monthly revenue
      - `monthly_expenses` (numeric) - Base monthly expenses
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `scenarios`
      - `id` (uuid, primary key) - Scenario identifier
      - `budget_id` (uuid, foreign key) - Associated budget
      - `name` (text) - Scenario name
      - `engineers_count` (integer) - Number of engineers to hire
      - `engineer_salary` (numeric) - Average engineer salary
      - `marketing_spend` (numeric) - Additional marketing spend
      - `price_increase_percent` (numeric) - Product price increase percentage
      - `calculated_runway` (numeric) - Calculated runway in months
      - `calculated_monthly_burn` (numeric) - Monthly burn rate
      - `calculated_profit` (numeric) - Monthly profit/loss
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `exports`
      - `id` (uuid, primary key) - Export identifier
      - `user_id` (uuid, foreign key) - User who created export
      - `scenario_id` (uuid, foreign key) - Exported scenario
      - `export_data` (jsonb) - Full export data
      - `created_at` (timestamptz) - Export timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only read/write their own budgets, scenarios, and exports
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'My Budget',
  initial_cash numeric NOT NULL DEFAULT 0,
  monthly_revenue numeric NOT NULL DEFAULT 0,
  monthly_expenses numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Base Scenario',
  engineers_count integer NOT NULL DEFAULT 0,
  engineer_salary numeric NOT NULL DEFAULT 0,
  marketing_spend numeric NOT NULL DEFAULT 0,
  price_increase_percent numeric NOT NULL DEFAULT 0,
  calculated_runway numeric NOT NULL DEFAULT 0,
  calculated_monthly_burn numeric NOT NULL DEFAULT 0,
  calculated_profit numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scenarios for own budgets"
  ON scenarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = scenarios.budget_id
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scenarios for own budgets"
  ON scenarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = scenarios.budget_id
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenarios for own budgets"
  ON scenarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = scenarios.budget_id
      AND budgets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = scenarios.budget_id
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scenarios for own budgets"
  ON scenarios FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budgets
      WHERE budgets.id = scenarios.budget_id
      AND budgets.user_id = auth.uid()
    )
  );

-- Create exports table
CREATE TABLE IF NOT EXISTS exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  scenario_id uuid REFERENCES scenarios(id) ON DELETE CASCADE NOT NULL,
  export_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON exports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exports"
  ON exports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exports"
  ON exports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_budget_id ON scenarios(budget_id);
CREATE INDEX IF NOT EXISTS idx_exports_user_id ON exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_scenario_id ON exports(scenario_id);
