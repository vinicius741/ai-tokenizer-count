import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { ModelInfoCard } from "./ModelInfoCard"
import type { TokenizerInfo } from '@epub-counter/shared'
import { cn } from "@/lib/utils"

interface HFModelComboboxProps {
  models: TokenizerInfo[]
  selectedModels: string[]
  onSelectionChange: (models: string[]) => void
}

export function HFModelCombobox({ models, selectedModels, onSelectionChange }: HFModelComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const hfModels = models.filter(m => m.id.startsWith('hf:'))

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      onSelectionChange(selectedModels.filter(m => m !== modelId))
    } else {
      onSelectionChange([...selectedModels, modelId])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedModels.length > 0
            ? `${selectedModels.length} HF model${selectedModels.length > 1 ? 's' : ''} selected`
            : "Select Hugging Face models..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search Hugging Face models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {hfModels.map((model) => (
                <HoverCard key={model.id}>
                  <HoverCardTrigger asChild>
                    <CommandItem
                      value={`${model.id} ${model.name}`}
                      onSelect={() => toggleModel(model.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedModels.includes(model.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1">{model.name}</span>
                    </CommandItem>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" align="start" className="w-80">
                    <ModelInfoCard model={model} />
                  </HoverCardContent>
                </HoverCard>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
