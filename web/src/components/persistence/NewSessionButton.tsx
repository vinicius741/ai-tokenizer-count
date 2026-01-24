import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NewSessionButtonProps {
  onClear: () => void
}

export function NewSessionButton({ onClear }: NewSessionButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClear}
      className="w-full min-h-[44px]"
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      New Session
    </Button>
  )
}
