/**
 * Provider Pricing Data and Cost Calculation
 *
 * Provides current pricing data for major LLM providers (OpenAI, Anthropic, Google)
 * and cost calculation functions for estimating EPUB processing costs.
 *
 * Pricing data is as of 2026-01 and should be updated quarterly.
 */

/**
 * Pricing metadata for version tracking and updates
 */
export const PRICING_METADATA = {
  /** Last pricing update date */
  lastUpdated: '2026-01-24',
  /** Next scheduled review date (quarterly) */
  nextReview: '2026-04-24',
  /** Source of pricing information */
  source: 'Official provider pricing pages',
} as const

/**
 * Provider pricing information
 */
export interface ProviderPricing {
  /** Provider name */
  name: string;
  /** Input price per million tokens (USD) */
  inputPrice: number;
  /** Output price per million tokens (USD) */
  outputPrice: number;
  /** URL for current pricing information */
  pricingUrl: string;
}

/**
 * Cost estimate for a given token count
 */
export interface CostEstimate {
  /** Provider identifier */
  provider: 'openai' | 'anthropic' | 'google';
  /** Provider display name */
  providerName: string;
  /** Input token cost (USD) */
  inputCost: number;
  /** Output token cost (USD) */
  outputCost: number;
  /** Total cost (USD) */
  totalCost: number;
  /** Price per million tokens (input) */
  inputPrice: number;
  /** Price per million tokens (output) */
  outputPrice: number;
  /** Pricing URL */
  pricingUrl: string;
}

/**
 * Provider pricing data as of 2026-01
 *
 * IMPORTANT: Update this data quarterly to maintain accuracy.
 * Sources:
 * - OpenAI: https://openai.com/api/pricing/
 * - Anthropic: https://www.anthropic.com/pricing
 * - Google: https://ai.google.dev/gemini-api/docs/pricing
 */
export const PROVIDER_PRICING: Record<'openai' | 'anthropic' | 'google', ProviderPricing> = {
  openai: {
    name: 'OpenAI',
    inputPrice: 2.50,
    outputPrice: 10.00,
    pricingUrl: 'https://openai.com/api/pricing/',
  },
  anthropic: {
    name: 'Anthropic',
    inputPrice: 3.00,
    outputPrice: 15.00,
    pricingUrl: 'https://www.anthropic.com/pricing',
  },
  google: {
    name: 'Google',
    inputPrice: 0.30,
    outputPrice: 2.50,
    pricingUrl: 'https://ai.google.dev/gemini-api/docs/pricing',
  },
};

/**
 * Calculate cost for a given token count and provider
 *
 * For EPUB processing, all tokens are typically input tokens (processing text as context).
 * However, for chat use cases, output tokens can be estimated using the outputMultiplier.
 *
 * @param tokenCount - Number of tokens to calculate cost for
 * @param provider - Provider identifier
 * @param outputMultiplier - Multiplier for output tokens (default: 0, all input)
 * @returns Cost estimate object
 */
export function calculateCost(
  tokenCount: number,
  provider: 'openai' | 'anthropic' | 'google',
  outputMultiplier: number = 0
): CostEstimate {
  const pricing = PROVIDER_PRICING[provider];

  // Calculate input cost
  const inputCost = (tokenCount / 1_000_000) * pricing.inputPrice;

  // Calculate output cost (if any)
  const outputTokens = tokenCount * outputMultiplier;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPrice;

  return {
    provider,
    providerName: pricing.name,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    inputPrice: pricing.inputPrice,
    outputPrice: pricing.outputPrice,
    pricingUrl: pricing.pricingUrl,
  };
}

/**
 * Get cost estimates for all providers
 *
 * Returns cost estimates for OpenAI, Anthropic, and Google for a given token count.
 *
 * @param tokenCount - Number of tokens to calculate costs for
 * @param outputMultiplier - Multiplier for output tokens (default: 0, all input)
 * @returns Array of cost estimates for all providers
 */
export function getAllCostEstimates(
  tokenCount: number,
  outputMultiplier: number = 0
): CostEstimate[] {
  return (Object.keys(PROVIDER_PRICING) as Array<'openai' | 'anthropic' | 'google'>).map(
    (provider) => calculateCost(tokenCount, provider, outputMultiplier)
  );
}

/**
 * Format cost as USD string
 *
 * @param cost - Cost in USD
 * @returns Formatted cost string (e.g., "$1.23")
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

/**
 * Format cost per million tokens string
 *
 * @param pricePerMillion - Price per million tokens
 * @returns Formatted price string (e.g., "$2.50/million tokens")
 */
export function formatPricePerMillion(pricePerMillion: number): string {
  return `$${pricePerMillion.toFixed(2)}/million tokens`;
}
