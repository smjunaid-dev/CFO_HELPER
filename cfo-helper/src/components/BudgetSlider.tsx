import React from 'react';

interface BudgetSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  formatValue?: (value: number) => string;
}

export const BudgetSlider: React.FC<BudgetSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix = '',
  suffix = '',
  formatValue,
}) => {
  const displayValue = formatValue ? formatValue(value) : `${prefix}${value.toLocaleString('en-IN')}${suffix}`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-semibold text-slate-900">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatValue ? formatValue(min) : `${prefix}${min.toLocaleString('en-IN')}${suffix}`}</span>
        <span>{formatValue ? formatValue(max) : `${prefix}${max.toLocaleString('en-IN')}${suffix}`}</span>
      </div>
    </div>
  );
};
