/**
 * Knapsack Algorithms for Budget Optimization
 *
 * Implements greedy O(n log n) algorithms for selecting EPUBs within a token budget.
 * Three strategies are provided:
 * - Max Books: Select shortest books first to maximize count
 * - Max Words: Select longest books that fit to maximize total word count
 * - Balanced: Select books by word-to-token ratio for balanced selection
 */

import type { EpubResult, TokenizerResult } from '@epub-counter/shared';

/**
 * Item representation for knapsack algorithm
 */
interface KnapsackItem {
  /** Original EPUB result */
  result: EpubResult;
  /** Token count for selected tokenizer */
  tokenCount: number;
  /** Word count */
  wordCount: number;
}

/**
 * Strategy type for knapsack optimization
 */
export type Strategy = 'max-books' | 'max-words' | 'balanced';

/**
 * Extract token count for a specific tokenizer from EpubResult
 */
function getTokenCount(result: EpubResult, tokenizerName: string): number {
  const tokenizerResult = result.tokenCounts.find(
    (t: TokenizerResult) => t.name === tokenizerName
  );
  return tokenizerResult?.count ?? 0;
}

/**
 * Transform EpubResult[] to KnapsackItem[] for a specific tokenizer
 */
function transformToKnapsackItems(results: EpubResult[], tokenizerName: string): KnapsackItem[] {
  return results
    .filter((result) => !result.error) // Filter out errored results
    .map((result) => ({
      result,
      tokenCount: getTokenCount(result, tokenizerName),
      wordCount: result.wordCount,
    }))
    .filter((item) => item.tokenCount > 0); // Filter out items with zero token count
}

/**
 * Max Books Strategy: Select shortest books first to maximize count
 *
 * This greedy algorithm sorts items by token count ascending (shortest first)
 * and adds items to the selection as long as they fit within the budget.
 * This maximizes the number of books selected.
 *
 * Time complexity: O(n log n) for sorting
 *
 * @param items - Items to select from
 * @param budget - Token budget constraint
 * @returns Selected items
 */
function knapsackMaxBooks(items: KnapsackItem[], budget: number): KnapsackItem[] {
  // Sort by token count ascending (shortest first)
  const sorted = [...items].sort((a, b) => a.tokenCount - b.tokenCount);

  const selected: KnapsackItem[] = [];
  let remainingBudget = budget;

  for (const item of sorted) {
    if (item.tokenCount <= remainingBudget) {
      selected.push(item);
      remainingBudget -= item.tokenCount;
    } else {
      // Greedy optimization: stop when next item doesn't fit
      // (since items are sorted by ascending token count)
      break;
    }
  }

  return selected;
}

/**
 * Max Words Strategy: Select longest books that fit to maximize total word count
 *
 * This greedy algorithm sorts items by token count descending (longest first)
 * and adds items to the selection as long as they fit within the budget.
 * This maximizes the total word count of selected books.
 *
 * Time complexity: O(n log n) for sorting
 *
 * @param items - Items to select from
 * @param budget - Token budget constraint
 * @returns Selected items
 */
function knapsackMaxWords(items: KnapsackItem[], budget: number): KnapsackItem[] {
  // Sort by token count descending (longest first)
  const sorted = [...items].sort((a, b) => b.tokenCount - a.tokenCount);

  const selected: KnapsackItem[] = [];
  let remainingBudget = budget;

  for (const item of sorted) {
    if (item.tokenCount <= remainingBudget) {
      selected.push(item);
      remainingBudget -= item.tokenCount;
    }
    // Continue through all items (no early break)
    // A smaller item might fit after a larger one
  }

  return selected;
}

/**
 * Balanced Strategy: Select books by word-to-token ratio for balanced selection
 *
 * This greedy algorithm sorts items by word-to-token ratio descending (highest density first)
 * and adds items to the selection as long as they fit within the budget.
 * This provides a balance between maximizing book count and total word count.
 *
 * Time complexity: O(n log n) for sorting
 *
 * @param items - Items to select from
 * @param budget - Token budget constraint
 * @returns Selected items
 */
function knapsackBalanced(items: KnapsackItem[], budget: number): KnapsackItem[] {
  // Sort by word-to-token ratio descending (highest density first)
  const sorted = [...items].sort((a, b) => {
    const ratioA = a.wordCount / a.tokenCount;
    const ratioB = b.wordCount / b.tokenCount;
    return ratioB - ratioA;
  });

  const selected: KnapsackItem[] = [];
  let remainingBudget = budget;

  for (const item of sorted) {
    if (item.tokenCount <= remainingBudget) {
      selected.push(item);
      remainingBudget -= item.tokenCount;
    }
  }

  return selected;
}

/**
 * Main knapsack solver function
 *
 * Orchestrates the knapsack algorithm by:
 * 1. Filtering out errored results
 * 2. Transforming to KnapsackItem[] with token count for selected tokenizer
 * 3. Filtering out items with zero token count
 * 4. Validating budget (return empty array if budget < min token count)
 * 5. Executing the appropriate strategy function
 * 6. Returning EpubResult[] from selected items
 *
 * @param results - Epub results to select from
 * @param budget - Token budget constraint
 * @param tokenizerName - Name of tokenizer to use for token counts
 * @param strategy - Selection strategy (default: 'max-books')
 * @returns Selected Epub results (empty array if budget insufficient)
 */
export function solveKnapsack(
  results: EpubResult[],
  budget: number,
  tokenizerName: string,
  strategy: Strategy = 'max-books'
): EpubResult[] {
  // Transform to KnapsackItem[] (filters out errors and zero token counts)
  const items = transformToKnapsackItems(results, tokenizerName);

  // Validate budget: return empty array if no items or budget insufficient for any item
  if (items.length === 0) {
    return [];
  }

  const minTokenCount = Math.min(...items.map((item) => item.tokenCount));
  if (budget < minTokenCount) {
    return [];
  }

  // Execute appropriate strategy
  let selectedItems: KnapsackItem[];
  switch (strategy) {
    case 'max-books':
      selectedItems = knapsackMaxBooks(items, budget);
      break;
    case 'max-words':
      selectedItems = knapsackMaxWords(items, budget);
      break;
    case 'balanced':
      selectedItems = knapsackBalanced(items, budget);
      break;
    default:
      // Default to max-books for unknown strategy
      selectedItems = knapsackMaxBooks(items, budget);
  }

  // Return EpubResult[] from selected items
  return selectedItems.map((item) => item.result);
}

// Export individual strategy functions for testing
export { knapsackMaxBooks, knapsackMaxWords, knapsackBalanced };
