export interface BudgetInputs {
  initialCash: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  engineersCount: number;
  engineerSalary: number;
  marketingSpend: number;
  priceIncreasePercent: number;
}

export interface FinancialMetrics {
  runway: number;
  monthlyBurn: number;
  monthlyProfit: number;
  cashBuffer: number;
  projectedRevenue: number;
  totalExpenses: number;
}

export interface MonthlyProjection {
  month: number;
  cash: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export function calculateFinancials(inputs: BudgetInputs): FinancialMetrics {
  const adjustedRevenue = inputs.monthlyRevenue * (1 + inputs.priceIncreasePercent / 100);

  const engineeringCost = inputs.engineersCount * inputs.engineerSalary;

  const totalExpenses = inputs.monthlyExpenses + engineeringCost + inputs.marketingSpend;

  const monthlyProfit = adjustedRevenue - totalExpenses;

  const monthlyBurn = monthlyProfit < 0 ? Math.abs(monthlyProfit) : 0;

  let runway = 0;
  if (monthlyBurn > 0) {
    runway = inputs.initialCash / monthlyBurn;
  } else if (monthlyProfit > 0) {
    runway = Infinity;
  } else {
    runway = Infinity;
  }

  const cashBuffer = inputs.initialCash;

  return {
    runway: runway === Infinity ? 999 : Math.max(0, runway),
    monthlyBurn,
    monthlyProfit,
    cashBuffer,
    projectedRevenue: adjustedRevenue,
    totalExpenses,
  };
}

export function projectCashFlow(inputs: BudgetInputs, months: number = 24): MonthlyProjection[] {
  const metrics = calculateFinancials(inputs);
  const projections: MonthlyProjection[] = [];

  let currentCash = inputs.initialCash;

  for (let month = 0; month <= months; month++) {
    projections.push({
      month,
      cash: Math.max(0, currentCash),
      revenue: metrics.projectedRevenue,
      expenses: metrics.totalExpenses,
      profit: metrics.monthlyProfit,
    });

    currentCash += metrics.monthlyProfit;

    if (currentCash <= 0 && metrics.monthlyProfit < 0) {
      break;
    }
  }

  return projections;
}

export function compareScenarios(
  _base: BudgetInputs,
  scenarios: BudgetInputs[]
): { scenario: BudgetInputs; metrics: FinancialMetrics }[] {
  return scenarios.map(scenario => ({
    scenario,
    metrics: calculateFinancials(scenario),
  }));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRunway(months: number): string {
  if (months === 999 || months === Infinity) {
    return 'Profitable';
  }

  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);

  if (years > 0 && remainingMonths > 0) {
    return `${years}y ${remainingMonths}m`;
  } else if (years > 0) {
    return `${years}y`;
  } else {
    return `${Math.round(months)}m`;
  }
}
