import { useCallback, useState } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileChip } from './FileChip'
import { validateResultsFile } from '@/lib/schema-validator'
import { toast } from 'sonner'
import type { ResultsOutput } from '@epub-counter/shared'

interface FileDropzoneProps {
  onFileLoaded: (data: ResultsOutput, fileName: string) => void
}

export function FileDropzone({ onFileLoaded }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: ResultsOutput } | null>(null)

  const processFile = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      const validation = validateResultsFile(json)
      if (!validation.valid) {
        toast.error('Invalid results.json', {
          description: validation.errors.join(', ')
        })
        return
      }

      setSelectedFile({ name: file.name, data: json })
      onFileLoaded(json, file.name)
      toast.success('Results loaded successfully', {
        description: `Loaded ${json.results.length} EPUB${json.results.length !== 1 ? 's' : ''}`
      })
    } catch (error) {
      toast.error('Failed to parse file', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [onFileLoaded])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleRemove = useCallback(() => {
    setSelectedFile(null)
  }, [])

  if (selectedFile) {
    return <FileChip fileName={selectedFile.name} onRemove={handleRemove} />
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
        "hover:border-primary/50 hover:bg-primary/5",
        isDragging && "border-primary bg-primary/10 scale-[1.02]",
        !isDragging && "border-muted-foreground/25"
      )}
    >
      <input
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm font-medium text-foreground">
          Drop results.json file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          File will be validated against schema v1.0
        </p>
      </label>
    </div>
  )
}
