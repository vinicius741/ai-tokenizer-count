import { useEffect, useState, useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { Clock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSseConnection, type ProgressData } from '@/hooks/use-sse-connection'
import type { ResultsOutput } from '@epub-counter/shared'

interface ProcessingProgressProps {
  jobId: string
  onComplete: (results: ResultsOutput) => void
}

export function ProcessingProgress({ jobId, onComplete }: ProcessingProgressProps) {
  const [progress, setProgress] = useState<ProgressData>({
    current: 0,
    total: 0,
    filename: '',
    timestamp: new Date().toISOString(),
  })
  const [startTime] = useState(() => Date.now())

  const percentage = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  // Calculate ETA based on average time per EPUB
  const eta = useMemo(() => {
    if (progress.current === 0 || progress.total === 0) return null

    const elapsed = Date.now() - startTime
    const avgTimePerEpub = elapsed / progress.current
    const remaining = progress.total - progress.current
    const etaMs = avgTimePerEpub * remaining

    const minutes = Math.floor(etaMs / 60000)
    const seconds = Math.floor((etaMs % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`
    }
    return `${seconds}s remaining`
  }, [progress.current, progress.total, startTime])

  const { connect } = useSseConnection()

  useEffect(() => {
    connect(jobId, {
      onProgress: (data) => {
        setProgress(data)
      },
      onComplete: (results) => {
        onComplete(results as ResultsOutput)
      },
      onError: (error) => {
        console.error('SSE error:', error)
      },
    })
  }, [jobId, connect, onComplete])

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      {/* Progress bar with stripes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Processing EPUBs</span>
          <span className="text-muted-foreground">
            {progress.current} / {progress.total} ({percentage}%)
          </span>
        </div>

        <div className="relative">
          <Progress value={percentage} className="h-3" />
          {/* Striped overlay */}
          {percentage > 0 && (
            <div
              className={cn(
                "absolute inset-0 progress-striped rounded-full",
                "opacity-50"
              )}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>

      {/* Current file */}
      {progress.filename && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 shrink-0" />
          <span className="truncate">{progress.filename}</span>
        </div>
      )}

      {/* ETA */}
      {eta && progress.current > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span>{eta}</span>
        </div>
      )}
    </div>
  )
}
