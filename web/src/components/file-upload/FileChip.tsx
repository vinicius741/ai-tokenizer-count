import { FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FileChipProps {
  fileName: string
  onRemove: () => void
}

export function FileChip({ fileName, onRemove }: FileChipProps) {
  return (
    <Badge variant="secondary" className="gap-2 px-3 py-2 text-sm">
      <FileText className="h-4 w-4" />
      <span className="max-w-[200px] truncate">{fileName}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 hover:bg-transparent"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  )
}
