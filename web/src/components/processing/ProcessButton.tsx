import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

interface ProcessButtonProps {
  folderPath: string
  selectedTokenizers: string[]
  onJobStarted: (jobId: string) => void
  onCancel?: () => void
  disabled?: boolean
  isProcessing?: boolean
  jobId?: string // Added for cancel endpoint call
}

export function ProcessButton({
  folderPath,
  selectedTokenizers,
  onJobStarted,
  onCancel,
  disabled: externallyDisabled,
  isProcessing = false,
  jobId,
}: ProcessButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const isDisabled =
    externallyDisabled ||
    !folderPath.trim() ||
    selectedTokenizers.length === 0 ||
    isLoading

  const handleClick = async () => {
    if (isDisabled) return

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8787/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputPath: folderPath,
          tokenizerList: selectedTokenizers,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to start processing')
      }

      toast.success('Processing started', {
        description: `Job ID: ${data.data.jobId}`
      })

      onJobStarted(data.data.jobId)
    } catch (error) {
      toast.error('Failed to start processing', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    // Call backend cancel endpoint if jobId is available
    if (jobId) {
      try {
        await fetch(`http://localhost:8787/api/cancel/${jobId}`, {
          method: 'POST',
        })
      } catch (error) {
        console.error('Failed to cancel backend job:', error)
        // Continue with frontend cancel even if backend call fails
      }
    }

    onCancel?.()
    toast.info('Processing cancelled', {
      description: 'Click Reset to start a new process'
    })
  }

  // Show Cancel button when processing
  if (isProcessing) {
    return (
      <Button
        onClick={handleCancel}
        variant="destructive"
        className="w-full"
        size="lg"
      >
        <X className="mr-2 h-4 w-4" />
        Cancel Processing
      </Button>
    )
  }

  // Show Process button when not processing
  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          Starting...
        </>
      ) : (
        'Process EPUBs'
      )}
    </Button>
  )
}
