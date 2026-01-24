import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useDebounce } from '@/hooks/use-debounce'
import type { EpubResult, TokenizerType } from '@epub-counter/shared'

export type OptimizationStrategy = 'max-books' | 'max-words' | 'balanced'

interface BudgetCalculatorProps {
  /** Results from EPUB processing */
  results: EpubResult[]
  /** Callback when user clicks calculate with budget, tokenizer, and strategy */
  onCalculate: (budget: number, tokenizer: TokenizerType, strategy: OptimizationStrategy) => void
}

/**
 * Get display name for a tokenizer ID
 */
function getTokenizerDisplayName(tokenizerId: string): string {
  const displayNames: Record<string, string> = {
    gpt4: 'GPT-4',
    claude: 'Claude',
  }
  // For HF models, remove the 'hf:' prefix and use the model name
  if (tokenizerId.startsWith('hf:')) {
    return tokenizerId.slice(3)
  }
  return displayNames[tokenizerId] ?? tokenizerId
}

/**
 * BudgetCalculator - Form for inputting token budget and selecting optimization strategy
 *
 * Provides:
 * - Number input for manual budget entry
 * - Preset buttons (32K, 128K, 200K) for quick budget selection
 * - Tokenizer dropdown populated from results
 * - Strategy tabs (Max Books, Max Words, Balanced)
 * - Validation for insufficient budget
 * - localStorage persistence for all selections
 */
export function BudgetCalculator({ results, onCalculate }: BudgetCalculatorProps) {
  // Extract unique tokenizers from results
  const availableTokenizers = useMemo(() => {
    const tokenizerSet = new Set<TokenizerType>()
    results.forEach((result) => {
      result.tokenCounts.forEach((tc) => {
        tokenizerSet.add(tc.name as TokenizerType)
      })
    })
    return Array.from(tokenizerSet)
  }, [results])

  // Default to first available tokenizer or gpt4
  const defaultTokenizer: TokenizerType = availableTokenizers[0] || 'gpt4'

  // Form state with localStorage persistence
  const [budget, setBudget] = useLocalStorage<number>('budget-calculator-budget', 128000)
  const [selectedPreset, setSelectedPreset] = useLocalStorage<number | null>('budget-calculator-preset', 128000)
  const [tokenizer, setTokenizer] = useLocalStorage<TokenizerType>('budget-calculator-tokenizer', defaultTokenizer)
  const [strategy, setStrategy] = useLocalStorage<OptimizationStrategy>('budget-calculator-strategy', 'max-books')

  // Debounced budget value to prevent excessive recalculations
  const debouncedBudget = useDebounce(budget, 500)

  // Calculate minimum token count across all EPUBs for the selected tokenizer
  const minTokens = useMemo(() => {
    let min = Infinity
    results.forEach((result) => {
      const tokenizerResult = result.tokenCounts.find((tc) => tc.name === tokenizer)
      if (tokenizerResult && tokenizerResult.count > 0 && tokenizerResult.count < min) {
        min = tokenizerResult.count
      }
    })
    return min === Infinity ? 0 : min
  }, [results, tokenizer])

  // Validate budget - must be at least the minimum EPUB token count
  const isValid = debouncedBudget > 0 && debouncedBudget >= minTokens

  // Preset button values
  const presets = [
    { label: '32K', value: 32000 },
    { label: '128K', value: 128000 },
    { label: '200K', value: 200000 },
  ]

  // Handle preset button click
  const handlePresetClick = (value: number) => {
    setBudget(value)
    setSelectedPreset(value)
  }

  // Handle manual budget input
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 0) {
      setBudget(value)
      // Clear preset selection if value doesn't match any preset
      if (!presets.some((p) => p.value === value)) {
        setSelectedPreset(null)
      }
    }
  }

  // Handle calculate button click
  const handleCalculate = () => {
    if (isValid) {
      onCalculate(debouncedBudget, tokenizer, strategy)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Budget Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Input Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Token Budget</label>

          {/* Preset Buttons */}
          <div className="flex gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant={selectedPreset === preset.value ? 'default' : 'outline'}
                onClick={() => handlePresetClick(preset.value)}
                className="flex-1"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Manual Input */}
          <Input
            type="number"
            min="0"
            step="1000"
            value={budget}
            onChange={handleBudgetChange}
            placeholder="Enter token budget"
            className="w-full"
          />
        </div>

        {/* Tokenizer Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Tokenizer</label>
          <select
            value={tokenizer}
            onChange={(e) => setTokenizer(e.target.value as TokenizerType)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {availableTokenizers.map((t) => (
              <option key={t} value={t}>
                {getTokenizerDisplayName(t)}
              </option>
            ))}
          </select>
        </div>

        {/* Optimization Strategy Tabs */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Optimization Strategy</label>
          <Tabs value={strategy} onValueChange={(v) => setStrategy(v as OptimizationStrategy)}>
            <TabsList className="w-full">
              <TabsTrigger value="max-books" className="flex-1">
                Max Books
              </TabsTrigger>
              <TabsTrigger value="max-words" className="flex-1">
                Max Words
              </TabsTrigger>
              <TabsTrigger value="balanced" className="flex-1">
                Balanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="max-books" className="mt-2 text-sm text-muted-foreground">
              Select shortest books first to maximize the number of books you can process.
            </TabsContent>

            <TabsContent value="max-words" className="mt-2 text-sm text-muted-foreground">
              Select longest books that fit to maximize total word count processed.
            </TabsContent>

            <TabsContent value="balanced" className="mt-2 text-sm text-muted-foreground">
              Balance between book count and word density for optimal coverage.
            </TabsContent>
          </Tabs>
        </div>

        {/* Validation Error */}
        {debouncedBudget > 0 && !isValid && minTokens > 0 && (
          <div className="p-3 border border-red-200 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              Budget is insufficient. Minimum budget needed is {minTokens.toLocaleString()} tokens
              (smallest EPUB with {getTokenizerDisplayName(tokenizer)}).
            </p>
          </div>
        )}

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          Calculate Optimal Selection
        </Button>
      </CardContent>
    </Card>
  )
}
