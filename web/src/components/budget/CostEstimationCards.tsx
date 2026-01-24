import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllCostEstimates, PRICING_METADATA, type CostEstimate } from '@/lib/pricing-data'

interface CostEstimationCardsProps {
  /** Total token count from selected books */
  tokenCount: number
}

/**
 * Format cost with 4 decimal places for precision
 */
function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`
}

/**
 * Format price per million tokens
 */
function formatPricePerMillion(price: number): string {
  return `$${price.toFixed(2)}/1M tokens`
}

/**
 * ProviderCard - Individual provider cost display
 */
interface ProviderCardProps {
  estimate: CostEstimate
}

function ProviderCard({ estimate }: ProviderCardProps) {
  const { providerName, totalCost, inputPrice, outputPrice, pricingUrl } = estimate

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{providerName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Cost */}
        <div>
          <p className="text-2xl font-bold">{formatCost(totalCost)}</p>
          <p className="text-sm text-muted-foreground">Estimated total cost</p>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Input:</span>
            <span className="font-medium">{formatPricePerMillion(inputPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Output:</span>
            <span className="font-medium">{formatPricePerMillion(outputPrice)}</span>
          </div>
        </div>

        {/* Pricing Link */}
        <a
          href={pricingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View pricing
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  )
}

/**
 * CostEstimationCards - Provider cost estimation display
 *
 * Shows estimated processing costs for OpenAI, Anthropic, and Google
 * based on the selected book token count. Each provider card displays:
 * - Total cost estimate (4 decimal places)
 * - Input/output pricing per million tokens
 * - Link to official provider pricing page
 *
 * Note: For EPUB processing, all tokens are input tokens (reading text).
 * Output costs are shown but input-only cost is the primary estimate.
 */
export function CostEstimationCards({ tokenCount }: CostEstimationCardsProps) {
  const estimates = getAllCostEstimates(tokenCount)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Estimated Cost</h3>
        <a
          href="https://github.com/viniciusmoreira/ai-tokenizer-count"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <span>Pricing methodology</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {estimates.map((estimate) => (
          <ProviderCard key={estimate.provider} estimate={estimate} />
        ))}
      </div>

      {/* Footer Disclaimer */}
      <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
        <p>
          <strong>Disclaimer:</strong> Costs are estimates only. Actual costs may vary based on model version, region, and usage.
        </p>
        <p>Verify with provider before making decisions.</p>
        <p className="flex items-center gap-1">
          Pricing as of {PRICING_METADATA.lastUpdated}
          {' · '}
          <a
            href="https://github.com/viniciusmoreira/ai-tokenizer-count"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
          >
            Source
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  )
}
