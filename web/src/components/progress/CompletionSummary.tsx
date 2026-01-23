import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ResultsOutput } from '@epub-counter/shared'

interface CompletionSummaryProps {
  results: ResultsOutput
}

export function CompletionSummary({ results }: CompletionSummaryProps) {
  const epubCount = results.summary.total
  const successCount = results.summary.success
  const failedCount = results.summary.failed
  const tokenizerNames = results.options.tokenizers || []

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold">Processing Complete</h3>
            <p className="text-sm text-muted-foreground">
              Successfully processed {successCount} of {epubCount} EPUB{epubCount !== 1 ? 's' : ''} with {tokenizerNames.length} tokenizer{tokenizerNames.length !== 1 ? 's' : ''}.
              {failedCount > 0 && ` ${failedCount} failed.`}
            </p>
            <div className="text-xs text-muted-foreground">
              Tokenizers: {tokenizerNames.join(', ')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
