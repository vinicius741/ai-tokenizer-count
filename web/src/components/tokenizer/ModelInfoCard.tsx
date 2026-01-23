import type { TokenizerInfo } from '@epub-counter/shared'
import { Badge } from "@/components/ui/badge"

interface ModelInfoCardProps {
  model: TokenizerInfo
}

export function ModelInfoCard({ model }: ModelInfoCardProps) {
  return (
    <div className="space-y-2 p-3">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-sm">{model.name}</h4>
        {model.async && (
          <Badge variant="secondary" className="text-xs">
            Async
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{model.description}</p>
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">ID:</span> {model.id}
      </div>
      {model.id.startsWith('hf:') && (
        <a
          href={`https://huggingface.co/${model.id.replace('hf:', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          View on Hugging Face →
        </a>
      )}
    </div>
  )
}
