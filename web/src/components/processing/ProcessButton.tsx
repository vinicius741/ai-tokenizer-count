import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ProcessButtonProps {
  folderPath: string
  selectedTokenizers: string[]
  onJobStarted: (jobId: string) => void
  disabled?: boolean
}

export function ProcessButton({
  folderPath,
  selectedTokenizers,
  onJobStarted,
  disabled: externallyDisabled
}: ProcessButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Button is disabled if:
  // - Externally disabled
  // - No folder path
  // - No tokenizers selected
  // - Currently loading
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

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Starting...
        </>
      ) : (
        'Process EPUBs'
      )}
    </Button>
  )
}
