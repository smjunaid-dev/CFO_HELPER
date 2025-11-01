import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { FinancialMetrics } from '../lib/financialCalculator';
import { formatCurrency, formatRunway } from '../lib/financialCalculator';

interface ScenarioComparisonProps {
  baseMetrics: FinancialMetrics;
  currentMetrics: FinancialMetrics;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  baseMetrics,
  currentMetrics,
}) => {
  const getDifference = (current: number, base: number) => {
    const diff = current - base;
    const percentChange = base !== 0 ? (diff / base) * 100 : 0;
    return { diff, percentChange };
  };

  const runwayDiff = getDifference(currentMetrics.runway, baseMetrics.runway);
  const profitDiff = getDifference(currentMetrics.monthlyProfit, baseMetrics.monthlyProfit);
  const cashDiff = getDifference(currentMetrics.cashBuffer, baseMetrics.cashBuffer);

  const renderTrend = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const renderChange = (diff: number, percentChange: number, isCurrency: boolean = false) => {
    const color = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-slate-600';
    const prefix = diff > 0 ? '+' : '';
    const displayValue = isCurrency ? formatCurrency(diff) : diff.toFixed(1);

    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {renderTrend(diff)}
        <span className="text-sm font-medium">
          {prefix}
          {displayValue}
          {!isCurrency && 'm'} ({prefix}
          {percentChange.toFixed(1)}%)
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Scenario Impact</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="text-sm text-slate-600">Runway Change</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatRunway(baseMetrics.runway)} → {formatRunway(currentMetrics.runway)}
            </p>
          </div>
          {renderChange(runwayDiff.diff, runwayDiff.percentChange)}
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="text-sm text-slate-600">Monthly Profit Change</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatCurrency(baseMetrics.monthlyProfit)} → {formatCurrency(currentMetrics.monthlyProfit)}
            </p>
          </div>
          {renderChange(profitDiff.diff, profitDiff.percentChange, true)}
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="text-sm text-slate-600">Cash Buffer</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatCurrency(baseMetrics.cashBuffer)} → {formatCurrency(currentMetrics.cashBuffer)}
            </p>
          </div>
          {renderChange(cashDiff.diff, cashDiff.percentChange, true)}
        </div>
      </div>
    </div>
  );
};
