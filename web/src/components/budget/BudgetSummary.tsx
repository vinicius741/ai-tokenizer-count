/**
 * Budget Summary Component
 *
 * Displays high-level budget metrics including count of selected books,
 * total tokens used, and percentage of budget consumed.
 */

interface BudgetSummaryProps {
  /** Number of selected books */
  count: number;
  /** Total tokens for selected books */
  totalTokens: number;
  /** Total token budget */
  budget: number;
}

/**
 * Budget Summary
 *
 * Renders a one-line summary showing:
 * - Number of selected books (bold)
 * - Total tokens used / budget (with percentage)
 *
 * Example: "15 selected · 45,231 / 128,000 tokens (35% used)"
 *
 * @param props - Component props
 * @returns React component
 */
export function BudgetSummary({ count, totalTokens, budget }: BudgetSummaryProps) {
  const percentUsed = budget > 0 ? Math.round((totalTokens / budget) * 100) : 0;

  return (
    <div className="text-sm">
      <span className="font-semibold">{count}</span>
      <span className="text-muted-foreground">
        {' '}
        selected · {totalTokens.toLocaleString()} / {budget.toLocaleString()} tokens ({percentUsed}% used)
      </span>
    </div>
  );
}
