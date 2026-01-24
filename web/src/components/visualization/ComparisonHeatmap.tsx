/**
 * ComparisonHeatmap Component
 *
 * Displays a multi-tokenizer comparison heatmap showing percentage differences
 * relative to the lowest token count for each EPUB.
 */

import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCsvExport } from '@/lib/csv-export'
import { transformToComparisonData, getHeatmapColor, type ComparisonData } from '@/lib/chart-utils'
import type { EpubResult } from '@epub-counter/shared'

export interface ComparisonHeatmapProps {
  /** Results data to visualize */
  data: EpubResult[]
  /** Tokenizer names to display as columns */
  tokenizers: string[]
}

/**
 * Transform comparison data to CSV format
 */
function transformComparisonToCsv(comparisonData: ComparisonData[], tokenizers: string[]) {
  return comparisonData.map((row) => {
    const csvRow: Record<string, string | number> = {
      'EPUB Title': row.epubTitle,
      'Lowest Count': row.lowestCount,
    }

    // Add percentage columns for each tokenizer
    tokenizers.forEach((tokenizer) => {
      csvRow[`${tokenizer} (%)`] = row.percentages[tokenizer]?.toFixed(1) ?? 'N/A'
      csvRow[`${tokenizer} (tokens)`] = row.tokenizers[tokenizer] ?? 0
    })

    return csvRow
  })
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
 * ComparisonHeatmap Component
 *
 * Shows EPUBs as rows and tokenizers as columns, with cells colored
 * by percentage difference relative to the lowest token count.
 */
export function ComparisonHeatmap({ data, tokenizers }: ComparisonHeatmapProps) {
  // Transform data to comparison format
  const comparisonData = useMemo(() => {
    return transformToComparisonData(data, tokenizers)
  }, [data, tokenizers])

  // Prepare CSV export data
  const csvData = useMemo(() => {
    return transformComparisonToCsv(comparisonData, tokenizers)
  }, [comparisonData, tokenizers])

  const { CSVDownloader, filename } = useCsvExport({
    data,
    tokenizers,
    filename: `comparison-heatmap-${new Date().toISOString().slice(0, 10)}.csv`,
  })

  // Use the prepared CSV data instead of the default
  const exportData = useMemo(() => {
    return { CSVDownloader, csvData, filename }
  }, [CSVDownloader, csvData, filename])

  if (comparisonData.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tokenizer Comparison</CardTitle>
        <exportData.CSVDownloader
          data={exportData.csvData}
          filename={exportData.filename}
          className="w-auto"
        >
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </exportData.CSVDownloader>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-medium text-sm sticky left-0 bg-background">
                  EPUB
                </th>
                {tokenizers.map((tokenizer) => (
                  <th key={tokenizer} className="p-3 text-center font-medium text-sm min-w-[120px]">
                    {getTokenizerDisplayName(tokenizer)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-muted/50">
                  {/* EPUB Title Cell */}
                  <td className="p-3 text-sm font-medium sticky left-0 bg-background hover:bg-muted/50">
                    {row.epubTitle}
                  </td>
                  {/* Tokenizer Percentage Cells */}
                  {tokenizers.map((tokenizer) => {
                    const percentage = row.percentages[tokenizer] ?? 0
                    const tokenCount = row.tokenizers[tokenizer] ?? 0
                    const colorClass = getHeatmapColor(percentage)

                    return (
                      <td key={tokenizer} className="p-2">
                        <div
                          className={`
                            ${colorClass}
                            rounded-md px-3 py-2 text-center text-sm font-medium
                            transition-colors cursor-help
                          `}
                          title={`${getTokenizerDisplayName(tokenizer)}\n${row.epubTitle}\n\nToken Count: ${tokenCount.toLocaleString()}\nPercentage: ${percentage.toFixed(1)}% of lowest (${row.lowestCount.toLocaleString()})`}
                        >
                          {percentage.toFixed(1)}%
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-100 rounded" />
            <span>100-105%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-200 rounded" />
            <span>105-115%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-300 rounded" />
            <span>115-125%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-400 rounded" />
            <span>125-140%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>140%+</span>
          </div>
          <span className="ml-auto">Percentages relative to lowest token count</span>
        </div>
      </CardContent>
    </Card>
  )
}
