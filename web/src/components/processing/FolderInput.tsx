import { useState } from 'react'
import { FolderOpen, Edit2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FolderInputProps {
  value: string
  onChange: (path: string) => void
}

export function FolderInput({ value, onChange }: FolderInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempPath, setTempPath] = useState(value)

  const handleSave = () => {
    onChange(tempPath)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempPath(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={tempPath}
          onChange={(e) => setTempPath(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="/path/to/epubs"
          className="flex-1"
          autoFocus
        />
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 border rounded-md transition-colors",
        value ? "border-border bg-background" : "border-muted-foreground/25"
      )}
    >
      <FolderOpen className={cn(
        "h-4 w-4",
        value ? "text-foreground" : "text-muted-foreground"
      )} />
      {value ? (
        <span className="flex-1 text-sm font-mono truncate">{value}</span>
      ) : (
        <span className="flex-1 text-sm text-muted-foreground">
          Enter EPUB folder path
        </span>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-8 w-8 p-0"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
