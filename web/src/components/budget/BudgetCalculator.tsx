import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useBudgetCalculator } from '@/hooks/use-budget-calculator'
import { BudgetSummary } from './BudgetSummary'
import { BudgetProgressBar } from './BudgetProgressBar'
import { SelectedBooksTable } from './SelectedBooksTable'
import { ExportButtons } from './ExportButtons'
import { CostEstimationCards } from './CostEstimationCards'
import type { EpubResult, TokenizerType } from '@epub-counter/shared'

export type OptimizationStrategy = 'max-books' | 'max-words' | 'balanced'

interface BudgetCalculatorProps {
  /** Results from EPUB processing */
  results: EpubResult[]
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
 * - Automatic calculation and display of selected books
 * - Export functionality (clipboard and JSON download)
 * - localStorage persistence for all selections
 */
export function BudgetCalculator({ results }: BudgetCalculatorProps) {
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

  // Use budget calculator hook - updates default tokenizer if needed
  const {
    state,
    result,
    isValid,
    setBudget,
    setPreset,
    setTokenizer,
    setStrategy,
  } = useBudgetCalculator(results)

  // Update tokenizer if not set and we have available tokenizers
  if (availableTokenizers.length > 0 && state.tokenizer === 'gpt4' && defaultTokenizer !== 'gpt4') {
    setTokenizer(defaultTokenizer)
  }

  // Calculate minimum token count across all EPUBs for the selected tokenizer
  const minTokens = useMemo(() => {
    let min = Infinity
    results.forEach((result) => {
      const tokenizerResult = result.tokenCounts.find((tc) => tc.name === state.tokenizer)
      if (tokenizerResult && tokenizerResult.count > 0 && tokenizerResult.count < min) {
        min = tokenizerResult.count
      }
    })
    return min === Infinity ? 0 : min
  }, [results, state.tokenizer])

  // Preset button values
  const presets = [
    { label: '32K', value: 32000 },
    { label: '128K', value: 128000 },
    { label: '200K', value: 200000 },
  ]

  // Handle preset button click
  const handlePresetClick = (value: number) => {
    setPreset(value)
  }

  // Handle manual budget input
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 0) {
      setBudget(value)
    }
  }

  const hasResults = result.selectedBooks.length > 0

  return (
    <div className="space-y-6">
      {/* Budget Input Card */}
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
                  variant={state.selectedPreset === preset.value ? 'default' : 'outline'}
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
              value={state.budget}
              onChange={handleBudgetChange}
              placeholder="Enter token budget"
              className="w-full"
            />
          </div>

          {/* Tokenizer Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tokenizer</label>
            <select
              value={state.tokenizer}
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
            <Tabs value={state.strategy} onValueChange={(v) => setStrategy(v as OptimizationStrategy)}>
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
          {state.budget > 0 && !isValid && minTokens > 0 && (
            <div className="p-3 border border-red-200 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                Budget is insufficient. Minimum budget needed is {minTokens.toLocaleString()} tokens
                (smallest EPUB with {getTokenizerDisplayName(state.tokenizer)}).
              </p>
            </div>
          )}

          {/* Info message when no results */}
          {state.budget > 0 && isValid && !hasResults && (
            <div className="p-3 border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Adjust your budget or strategy to see optimized book selection.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section - Only render when we have selected books */}
      {hasResults && (
        <div className="space-y-6">
          {/* Summary and Progress Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Selection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetSummary
                  count={result.selectedBooks.length}
                  totalTokens={result.totalTokens}
                  budget={state.budget}
                />
              </CardContent>
            </Card>

            <BudgetProgressBar
              used={result.totalTokens}
              remaining={result.remainingTokens}
              total={state.budget}
            />
          </div>

          {/* Selected Books Table */}
          <SelectedBooksTable
            books={result.selectedBooks}
            tokenizer={state.tokenizer}
            budget={state.budget}
            strategy={state.strategy}
          />

          {/* Export Buttons */}
          <ExportButtons
            books={result.selectedBooks}
            tokenizer={state.tokenizer}
            budget={state.budget}
            strategy={state.strategy}
          />

          {/* Cost Estimation */}
          <div>
            <CostEstimationCards tokenCount={result.totalTokens} />
          </div>
        </div>
      )}
    </div>
  )
}
