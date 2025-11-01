import { useState, useMemo } from 'react';
import {
  Calendar,
  TrendingDown,
  TrendingUp,
  Wallet,
  Download,
  RotateCcw,
} from 'lucide-react';
import { BudgetSlider } from './components/BudgetSlider';
import { MetricCard } from './components/MetricCard';
import { CashFlowChart } from './components/CashFlowChart';
import { ProfitChart } from './components/ProfitChart';
import { ScenarioComparison } from './components/ScenarioComparison';
import { AIQueryPanel } from './components/AIQueryPanel';
import type { BudgetInputs } from './lib/financialCalculator';
import {
  calculateFinancials,
  projectCashFlow,
  formatCurrency,
  formatRunway,
} from './lib/financialCalculator';

const DEFAULT_BUDGET: BudgetInputs = {
  initialCash: 5000000,
  monthlyRevenue: 800000,
  monthlyExpenses: 400000,
  engineersCount: 0,
  engineerSalary: 100000,
  marketingSpend: 0,
  priceIncreasePercent: 0,
};

function App() {
  const [budget, setBudget] = useState<BudgetInputs>(DEFAULT_BUDGET);
  const [baseBudget] = useState<BudgetInputs>(DEFAULT_BUDGET);

  const currentMetrics = useMemo(() => calculateFinancials(budget), [budget]);
  const baseMetrics = useMemo(() => calculateFinancials(baseBudget), [baseBudget]);
  const cashFlowData = useMemo(() => projectCashFlow(budget, 24), [budget]);

  const updateBudget = (key: keyof BudgetInputs, value: number) => {
    setBudget(prev => ({ ...prev, [key]: value }));
  };

  const applySuggestion = (updates: Partial<BudgetInputs>) => {
    setBudget(prev => ({ ...prev, ...updates }));
  };

  const resetBudget = () => {
    setBudget(DEFAULT_BUDGET);
  };

  const exportScenario = () => {
    const exportData = {
      budget,
      metrics: currentMetrics,
      projections: cashFlowData,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cfo-helper-scenario-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTrendForMetric = (value: number): 'up' | 'down' | 'neutral' => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">CFO Helper</h1>
              <p className="text-slate-600 mt-1">Interactive Financial Planning & Simulation</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetBudget}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={exportScenario}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Runway"
            value={formatRunway(currentMetrics.runway)}
            icon={Calendar}
            trend={currentMetrics.runway > baseMetrics.runway ? 'up' : currentMetrics.runway < baseMetrics.runway ? 'down' : 'neutral'}
            subtitle="Months until cash depletion"
          />
          <MetricCard
            title="Monthly Profit/Loss"
            value={formatCurrency(currentMetrics.monthlyProfit)}
            icon={currentMetrics.monthlyProfit >= 0 ? TrendingUp : TrendingDown}
            trend={getTrendForMetric(currentMetrics.monthlyProfit)}
            subtitle={`Burn: ${formatCurrency(currentMetrics.monthlyBurn)}/month`}
          />
          <MetricCard
            title="Cash Buffer"
            value={formatCurrency(currentMetrics.cashBuffer)}
            icon={Wallet}
            trend="neutral"
            subtitle="Available cash reserves"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Base Budget</h2>
              <div className="space-y-6">
                <BudgetSlider
                  label="Initial Cash"
                  value={budget.initialCash}
                  onChange={(v) => updateBudget('initialCash', v)}
                  min={0}
                  max={50000000}
                  step={100000}
                  formatValue={formatCurrency}
                />
                <BudgetSlider
                  label="Monthly Revenue"
                  value={budget.monthlyRevenue}
                  onChange={(v) => updateBudget('monthlyRevenue', v)}
                  min={0}
                  max={5000000}
                  step={50000}
                  formatValue={formatCurrency}
                />
                <BudgetSlider
                  label="Monthly Expenses"
                  value={budget.monthlyExpenses}
                  onChange={(v) => updateBudget('monthlyExpenses', v)}
                  min={0}
                  max={5000000}
                  step={50000}
                  formatValue={formatCurrency}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Scenario Variables</h2>
              <div className="space-y-6">
                <BudgetSlider
                  label="Number of Engineers to Hire"
                  value={budget.engineersCount}
                  onChange={(v) => updateBudget('engineersCount', v)}
                  min={0}
                  max={20}
                  step={1}
                />
                <BudgetSlider
                  label="Average Engineer Salary"
                  value={budget.engineerSalary}
                  onChange={(v) => updateBudget('engineerSalary', v)}
                  min={0}
                  max={300000}
                  step={10000}
                  formatValue={formatCurrency}
                />
                <BudgetSlider
                  label="Additional Marketing Spend"
                  value={budget.marketingSpend}
                  onChange={(v) => updateBudget('marketingSpend', v)}
                  min={0}
                  max={2000000}
                  step={50000}
                  formatValue={formatCurrency}
                />
                <BudgetSlider
                  label="Product Price Increase"
                  value={budget.priceIncreasePercent}
                  onChange={(v) => updateBudget('priceIncreasePercent', v)}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <AIQueryPanel currentBudget={budget} onApplySuggestion={applySuggestion} />

            <ScenarioComparison baseMetrics={baseMetrics} currentMetrics={currentMetrics} />

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Revenue (adjusted)</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(currentMetrics.projectedRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Total Expenses</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(currentMetrics.totalExpenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Engineering Cost</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(budget.engineersCount * budget.engineerSalary)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Marketing Cost</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(budget.marketingSpend)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CashFlowChart data={cashFlowData} />
          <ProfitChart data={cashFlowData} />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-600 text-sm">
            CFO Helper - Make confident financial decisions with real-time simulations
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
