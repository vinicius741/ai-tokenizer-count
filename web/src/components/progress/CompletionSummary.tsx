import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ResultsOutput } from '@epub-counter/shared'

interface CompletionSummaryProps {
  results: ResultsOutput
}

export function CompletionSummary({ results }: CompletionSummaryProps) {
  const successCount = results.results.filter(r =>
    r.tokenCounts && r.tokenCounts.length > 0
  ).length

  const failedCount = results.summary.failed

  return (
    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          Processing Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total EPUBs:</span>
          <span className="font-medium">{results.summary.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Successful:</span>
          <span className="font-medium text-green-700 dark:text-green-400">
            {successCount}
          </span>
        </div>
        {failedCount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Failed:</span>
            <span className="font-medium text-destructive">
              {failedCount}
            </span>
          </div>
        )}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Tokenizers used: {results.options.tokenizers?.join(', ') || 'None'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
