import { useEffect, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { HFModelCombobox } from "./HFModelCombobox"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { TokenizerInfo } from '@epub-counter/shared'
import { toast } from "sonner"

const STANDARD_TOKENIZERS = ['gpt4', 'claude'] as const

interface TokenizerSelectorProps {
  onSelectionChange?: (selectedTokenizers: string[]) => void
}

export function TokenizerSelector({ onSelectionChange }: TokenizerSelectorProps) {
  const [allModels, setAllModels] = useState<TokenizerInfo[]>([])
  const [selectedTokenizers, setSelectedTokenizers] = useLocalStorage<string[]>(
    'selected-tokenizers',
    ['gpt4', 'claude'] // Default to GPT-4 and Claude
  )

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedTokenizers)
  }, [selectedTokenizers, onSelectionChange])

  useEffect(() => {
    // Fetch available models from API
    fetch('http://localhost:8787/api/list-models')
      .then(res => res.json())
      .then((data) => {
        if (data.success) {
          setAllModels(data.data)
        } else {
          toast.error('Failed to load tokenizers')
        }
      })
      .catch(() => toast.error('Failed to connect to server'))
  }, [])

  const standardTokenizers = allModels.filter(m =>
    STANDARD_TOKENIZERS.includes(m.id as any)
  )

  const selectedStandard = selectedTokenizers.filter(t =>
    STANDARD_TOKENIZERS.includes(t as any)
  )

  const selectedHF = selectedTokenizers.filter(t => t.startsWith('hf:'))

  const toggleStandard = (value: string[]) => {
    // Remove standard tokenizers from selection, add new selection
    const otherTokenizers = selectedTokenizers.filter(t => !STANDARD_TOKENIZERS.includes(t as any))
    setSelectedTokenizers([...otherTokenizers, ...value])
  }

  const removeHF = (modelId: string) => {
    setSelectedTokenizers(selectedTokenizers.filter(t => t !== modelId))
  }

  const hasSelection = selectedTokenizers.length > 0

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Tokenizers</label>
        <p className="text-xs text-muted-foreground mb-3">
          Choose at least one tokenizer for EPUB processing
        </p>
      </div>

      {/* Standard tokenizers (GPT-4, Claude) */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Standard Tokenizers
        </label>
        <ToggleGroup
          type="multiple"
          value={selectedStandard}
          onValueChange={toggleStandard}
          variant="outline"
          className="flex flex-wrap gap-2"
        >
          {standardTokenizers.map((tokenizer) => (
            <ToggleGroupItem
              key={tokenizer.id}
              value={tokenizer.id}
              aria-label={`Select ${tokenizer.name}`}
              className="px-4 py-2"
            >
              {tokenizer.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Hugging Face models */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Hugging Face Models
        </label>
        <HFModelCombobox
          models={allModels}
          selectedModels={selectedHF}
          onSelectionChange={(hfModels) => {
            // Replace HF selection
            const nonHF = selectedTokenizers.filter(t => !t.startsWith('hf:'))
            setSelectedTokenizers([...nonHF, ...hfModels])
          }}
        />
      </div>

      {/* Selected HF models as badges */}
      {selectedHF.length > 0 && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Selected HF Models
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedHF.map((modelId) => {
              const model = allModels.find(m => m.id === modelId)
              return (
                <Badge key={modelId} variant="secondary" className="gap-1 pr-1">
                  {model?.name || modelId}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeHF(modelId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Validation message */}
      {!hasSelection && (
        <p className="text-sm text-destructive">
          Please select at least one tokenizer
        </p>
      )}

      {/* Summary */}
      {hasSelection && (
        <p className="text-xs text-muted-foreground">
          {selectedTokenizers.length} tokenizer{selectedTokenizers.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}
