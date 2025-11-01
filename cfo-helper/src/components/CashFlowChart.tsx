import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { MonthlyProjection } from '../lib/financialCalculator';

interface CashFlowChartProps {
  data: MonthlyProjection[];
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return `₹${(value / 100000).toFixed(1)}L`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Cash Flow Projection</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
            stroke="#64748b"
          />
          <YAxis
            tickFormatter={formatCurrency}
            label={{ value: 'Cash Balance', angle: -90, position: 'insideLeft' }}
            stroke="#64748b"
          />
          <Tooltip
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Cash Balance']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="cash"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorCash)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
