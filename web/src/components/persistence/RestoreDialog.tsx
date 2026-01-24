import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface RestoreDialogProps {
  hasSavedData: boolean
  onRestore: () => void
  onClear: () => void
}

export function RestoreDialog({ hasSavedData, onRestore, onClear }: RestoreDialogProps) {
  const [open, setOpen] = useState(false)

  // Open dialog when saved data is detected
  useEffect(() => {
    if (hasSavedData) {
      setOpen(true)
    }
  }, [hasSavedData])

  const handleRestore = () => {
    onRestore()
    setOpen(false)
  }

  const handleClear = () => {
    onClear()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore Previous Session?</DialogTitle>
          <DialogDescription>
            We found saved results from your last session. Would you like to restore them or start fresh?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Start Fresh
          </Button>
          <Button onClick={handleRestore}>
            Restore Results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
