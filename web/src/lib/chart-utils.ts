/**
 * Chart utility functions for EPUB Tokenizer Counter
 *
 * This module provides helper functions for data transformation,
 * color management, and other chart-related utilities.
 */

/**
 * Group an array of items by a key
 *
 * @param array - Array of items to group
 * @param key - Key to group by (can be nested like 'metadata.title')
 * @returns Record with keys as grouped values and arrays of items
 *
 * @example
 * ```ts
 * const data = [
 *   { name: 'Alice', age: 25 },
 *   { name: 'Bob', age: 30 },
 *   { name: 'Alice', age: 35 }
 * ];
 * const grouped = groupBy(data, 'name');
 * // { Alice: [{ name: 'Alice', age: 25 }, { name: 'Alice', age: 35 }], Bob: [...] }
 * ```
 */
export function groupBy<T extends Record<string, unknown>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  if (!Array.isArray(array) || array.length === 0) {
    return {};
  }

  return array.reduce((acc, item) => {
    const groupKey = String(item[key] ?? 'unknown');
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Tokenizer color palette for visualizations
 *
 * Maps tokenizer names to their display colors using HSL values
 * for consistent theming across all charts.
 */
export const TOKENIZER_COLORS: Record<string, string> = {
  gpt4: 'hsl(221, 83%, 53%)',        // Blue
  claude: 'hsl(25, 95%, 53%)',       // Orange
  // Hugging Face models
  'hf:bert-base-uncased': 'hsl(142, 71%, 45%)', // Green
  'hf:gpt2': 'hsl(280, 65%, 60%)',   // Purple
  'hf:distilbert-base-uncased': 'hsl(142, 71%, 45%)', // Green
  'hf:roberta-base': 'hsl(199, 89%, 48%)', // Sky blue
  // Fallback for unknown tokenizers
  default: 'hsl(215, 25%, 27%)',     // Slate
};

/**
 * Get color for a tokenizer by name
 *
 * Handles HF model prefix matching for consistent coloring
 *
 * @param tokenizerName - Name of the tokenizer
 * @returns HSL color string
 */
export function getTokenizerColor(tokenizerName: string): string {
  // Check for exact match first
  if (TOKENIZER_COLORS[tokenizerName]) {
    return TOKENIZER_COLORS[tokenizerName];
  }

  // Check for HF model prefix match (all HF models use green)
  if (tokenizerName.startsWith('hf:')) {
    return TOKENIZER_COLORS['hf:bert-base-uncased'];
  }

  // Return default color
  return TOKENIZER_COLORS.default;
}

/**
 * Format number with thousands separator
 *
 * @param value - Number to format
 * @returns Formatted string (e.g., "1,234,567")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Calculate percentage difference between two values
 *
 * @param value - The value to compare
 * @param baseline - The baseline value (100%)
 * @returns Percentage (e.g., 123.45 for 23.45% above baseline)
 */
export function calculatePercentage(value: number, baseline: number): number {
  if (baseline === 0) return 0;
  return (value / baseline) * 100;
}

/**
 * Get color class for heatmap based on percentage
 *
 * Uses sequential green scale: lighter = closer to baseline,
 * darker = higher percentage difference
 *
 * @param percentage - Percentage value (100 = baseline)
 * @returns Tailwind CSS color class name
 */
export function getHeatmapColor(percentage: number): string {
  if (percentage < 105) return 'bg-green-100';
  if (percentage < 115) return 'bg-green-200';
  if (percentage < 125) return 'bg-green-300';
  if (percentage < 140) return 'bg-green-400';
  return 'bg-green-500';
}

/**
 * Comparison data structure for multi-tokenizer heatmap
 */
export interface ComparisonData {
  /** EPUB title */
  epubTitle: string;
  /** Token counts by tokenizer name */
  tokenizers: Record<string, number>;
  /** Lowest token count across all tokenizers for this EPUB */
  lowestCount: number;
  /** Percentage differences relative to lowest count */
  percentages: Record<string, number>;
}

/**
 * Transform EpubResult[] to comparison data for heatmap visualization
 *
 * Calculates percentage differences relative to the lowest token count
 * for each EPUB across all tokenizers.
 *
 * @param results - Array of EpubResult to transform
 * @param tokenizerNames - List of tokenizer names to include
 * @returns Array of comparison data with percentages
 *
 * @example
 * ```ts
 * const comparisonData = transformToComparisonData(
 *   results,
 *   ['gpt4', 'claude', 'hf:bert-base-uncased']
 * );
 * // Returns: [
 * //   {
 * //     epubTitle: 'Book Title',
 * //     tokenizers: { gpt4: 1000, claude: 1120, 'hf:bert-base-uncased': 950 },
 * //     lowestCount: 950,
 * //     percentages: { gpt4: 105.26, claude: 117.89, 'hf:bert-base-uncased': 100 }
 * //   }
 * // ]
 * ```
 */
export function transformToComparisonData(
  results: import('@epub-counter/shared').EpubResult[],
  tokenizerNames: string[]
): ComparisonData[] {
  // Filter out results with errors
  const validResults = results.filter((result) => !result.error);

  return validResults.map((result) => {
    // Extract token counts for each tokenizer
    const tokenizers: Record<string, number> = {};
    tokenizerNames.forEach((tokenizerName) => {
      const tokenCount = result.tokenCounts.find(
        (t) => t.name === tokenizerName
      )?.count ?? 0;
      tokenizers[tokenizerName] = tokenCount;
    });

    // Find lowest count across all tokenizers (handle 0 case)
    const counts = Object.values(tokenizers);
    const lowestCount = Math.min(...counts.filter((c) => c > 0), 1);

    // Calculate percentages relative to lowest count
    const percentages: Record<string, number> = {};
    tokenizerNames.forEach((tokenizerName) => {
      const count = tokenizers[tokenizerName];
      percentages[tokenizerName] = lowestCount > 0
        ? (count / lowestCount) * 100
        : 0;
    });

    return {
      epubTitle: result.metadata.title,
      tokenizers,
      lowestCount,
      percentages,
    };
  });
}
