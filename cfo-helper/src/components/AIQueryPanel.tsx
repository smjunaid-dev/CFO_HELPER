import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import type { BudgetInputs } from '../lib/financialCalculator';

interface AIQueryPanelProps {
  currentBudget: BudgetInputs;
  onApplySuggestion: (updates: Partial<BudgetInputs>) => void;
}

export const AIQueryPanel: React.FC<AIQueryPanelProps> = ({ currentBudget, onApplySuggestion }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processQuery = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerQuery = query.toLowerCase();
    let suggestion = '';
    let updates: Partial<BudgetInputs> = {};

    if (lowerQuery.includes('hire') && lowerQuery.includes('engineer')) {
      const match = lowerQuery.match(/\d+/);
      const count = match ? parseInt(match[0]) : 3;
      updates = { engineersCount: currentBudget.engineersCount + count };
      suggestion = `I suggest hiring ${count} engineers. This will increase your monthly expenses by ₹${(count * currentBudget.engineerSalary).toLocaleString('en-IN')} and reduce your runway.`;
    } else if (lowerQuery.includes('marketing') || lowerQuery.includes('spend')) {
      const match = lowerQuery.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lac|l)/i);
      const amount = match ? parseFloat(match[1].replace(/,/g, '')) * 100000 : 200000;
      updates = { marketingSpend: currentBudget.marketingSpend + amount };
      suggestion = `Increasing marketing spend by ₹${amount.toLocaleString('en-IN')} could help boost revenue. Monitor the impact on your runway carefully.`;
    } else if (lowerQuery.includes('price') || lowerQuery.includes('increase')) {
      const match = lowerQuery.match(/\d+/);
      const percent = match ? parseInt(match[0]) : 10;
      updates = { priceIncreasePercent: Math.min(100, currentBudget.priceIncreasePercent + percent) };
      suggestion = `A ${percent}% price increase could improve profitability. Consider testing this with a subset of customers first.`;
    } else if (lowerQuery.includes('reduce') && lowerQuery.includes('cost')) {
      updates = { monthlyExpenses: Math.max(0, currentBudget.monthlyExpenses * 0.85) };
      suggestion = `Reducing operational costs by 15% could extend your runway significantly. Focus on non-essential expenses first.`;
    } else if (lowerQuery.includes('profitable') || lowerQuery.includes('break even')) {
      const deficit = currentBudget.monthlyExpenses - currentBudget.monthlyRevenue;
      if (deficit > 0) {
        suggestion = `To break even, you need to either increase revenue by ₹${deficit.toLocaleString('en-IN')}/month or reduce expenses by the same amount. Consider a combination of both strategies.`;
      } else {
        suggestion = `Great news! You're already profitable with a monthly profit of ₹${(currentBudget.monthlyRevenue - currentBudget.monthlyExpenses).toLocaleString('en-IN')}.`;
      }
    } else {
      suggestion = `I can help you with:
- Hiring decisions (e.g., "Should I hire 5 engineers?")
- Marketing budget (e.g., "What if I spend 2 lakh more on marketing?")
- Pricing strategy (e.g., "Increase price by 15%")
- Cost reduction (e.g., "How can I reduce costs?")
- Break-even analysis (e.g., "How can I become profitable?")`;
    }

    setResponse(suggestion);
    if (Object.keys(updates).length > 0) {
      setTimeout(() => onApplySuggestion(updates), 500);
    }

    setIsProcessing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">AI Financial Assistant</h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything about your finances..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Ask'}
          </button>
        </div>
      </form>

      {response && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-slate-700 whitespace-pre-line">{response}</p>
        </div>
      )}

      {!response && (
        <div className="text-sm text-slate-500">
          <p className="mb-2">Try asking:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>"Should I hire 3 engineers?"</li>
            <li>"What if I spend 2 lakh on marketing?"</li>
            <li>"How can I become profitable?"</li>
          </ul>
        </div>
      )}
    </div>
  );
};
