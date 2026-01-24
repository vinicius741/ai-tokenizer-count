/**
 * Budget Progress Bar Component
 *
 * Visual representation of budget utilization using a progress bar
 * with percentage display and remaining token count.
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BudgetProgressBarProps {
  /** Tokens used */
  used: number;
  /** Remaining tokens */
  remaining: number;
  /** Total budget */
  total: number;
}

/**
 * Budget Progress Bar
 *
 * Displays a visual progress indicator showing:
 * - Heading with "Budget Utilization"
 * - Used / total token counts
 * - Progress bar with percentage filled
 * - Percentage and remaining tokens below the bar
 *
 * @param props - Component props
 * @returns React component
 */
export function BudgetProgressBar({ used, remaining, total }: BudgetProgressBarProps) {
  const percentUsed = total > 0 ? (used / total) * 100 : 0;
  const percentDisplay = Math.round(percentUsed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Budget Utilization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Token counts */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {used.toLocaleString()} / {total.toLocaleString()} tokens
          </span>
        </div>

        {/* Progress bar */}
        <Progress value={percentUsed} className="h-2" />

        {/* Percentage and remaining */}
        <div className="flex justify-between text-sm">
          <span className="font-medium">{percentDisplay}% used</span>
          <span className="text-muted-foreground">
            {remaining.toLocaleString()} remaining
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
