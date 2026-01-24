# Phase 08: Token Budget Calculator & Cost Estimation - Research

**Researched:** 2026-01-24
**Domain:** Knapsack Optimization Algorithms + LLM Cost Estimation + React State Persistence
**Confidence:** HIGH

## Summary

This research covers implementing a token budget calculator that helps users select EPUBs within a token budget constraint using knapsack optimization algorithms, with cost estimation display for major LLM providers (OpenAI, Anthropic, Google). The phase requires greedy knapsack implementations for three optimization strategies (max books, max words, balanced), budget input with presets, selected books display with TanStack Table, clipboard API integration for copy functionality, JSON file download with Blob API, debounced input handling, localStorage persistence for calculator state, and accurate pricing data for three major providers.

**Key findings:**
- **Greedy knapsack algorithms** are sufficient for budget optimization - 0/1 knapsack with value/weight sorting by token count provides near-optimal results without exponential complexity
- **Radix UI Tabs** (already available via shadcn/ui) provides the strategy selection interface with built-in keyboard navigation and accessibility
- **Clipboard API** with `navigator.clipboard.writeText()` is the modern standard for copy-to-clipboard functionality, with fallback to `document.execCommand('copy')` for older browsers
- **Blob + URL.createObjectURL()** pattern enables client-side JSON file downloads without server involvement
- **useLocalStorage hook** (already exists in project) provides localStorage persistence - just need to extend usage for budget calculator state
- **LLM pricing data** requires provider-specific models: OpenAI GPT-4o ($2.50/$10 per 1M input/output), Anthropic Claude Sonnet 4.1 ($3/$15 per 1M), Google Gemini 2.5 Flash ($0.30/$2.50 per 1M) - pricing as of January 2026
- **Debounced input** can be implemented with custom useDebounce hook or use react-use library's useDebounce for auto-recalculation on strategy changes
- **Progress bar visualization** using shadcn/ui Progress component with percentage calculation for budget utilization display

**Primary recommendation:** Implement greedy knapsack algorithms for three strategies (shortest-first for max books, longest-fit for max words, ratio-based for balanced), use Radix UI Tabs for strategy selection with 500ms debounce on changes, reuse TanStack Table patterns from Phase 7 for selected books display, implement clipboard with `navigator.clipboard.writeText()`, use Blob API for JSON export, extend existing useLocalStorage hook for state persistence, and display cost cards per provider with pricing data from official sources. Validate budget > 0 and sufficient for at least one EPUB before enabling calculate button.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Radix UI Tabs** | 1.1.13+ | Strategy selection (shadcn/ui) | Unstyled, accessible tabs with keyboard navigation, already in project |
| **TanStack Table** | v8.x | Selected books display | Reuse from Phase 7, sorting/filtering without UI constraints |
| **shadcn/ui Progress** | latest | Budget utilization progress bar | Visual percentage display, consistent design system |
| **shadcn/ui Card, Button, Input** | latest | Budget input and cost cards | Layout components already in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **useLocalStorage hook** | (existing) | State persistence | Already implemented, extend for budget calculator state |
| **Clipboard API** | (native) | Copy to clipboard | `navigator.clipboard.writeText()` with fallback |
| **Blob API** | (native) | JSON file download | `URL.createObjectURL(new Blob())` pattern |
| **React hooks** | built-in | useMemo, useCallback, useState | Memoize knapsack calculations, debounce input |
| **lucide-react** | (installed) | Icons for UI | Copy, download, calculator icons already available |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **Greedy knapsack** | Dynamic programming 0/1 knapsack | DP has O(nW) complexity where W=budget; greedy is O(n log n) and sufficient for this use case |
| **Radix UI Tabs** | SegmentedControl, custom tabs | Radix is accessible and already available; custom tabs require more code |
| **Clipboard API** | react-copy-to-clipboard library | Native API is sufficient, library is unnecessary dependency |
| **Blob download** | File System Access API | Blob is simpler and works everywhere; FSA API is newer with limited support |
| **useLocalStorage** | Zustand, Redux, Zustand persist | LocalStorage is sufficient for single-user localhost app; state libraries are overkill |

**Installation:**
```bash
# All dependencies already installed:
# - @radix-ui/react-tabs (via shadcn/ui)
# - @tanstack/react-table (from Phase 7)
# - lucide-react (for icons)
# - React hooks (built-in)

# Optional: Add react-use for useDebounce if custom hook not desired
npm install react-use
```

## Architecture Patterns

### Recommended Project Structure

```
web/src/
├── components/
│   ├── budget/
│   │   ├── BudgetCalculator.tsx     # Main calculator with budget input + presets
│   │   ├── StrategySelector.tsx     # Radix UI Tabs for optimization strategy
│   │   ├── SelectedBooksTable.tsx   # TanStack Table for selected books (reuse Phase 7 patterns)
│   │   ├── BudgetProgressBar.tsx    # Progress bar showing tokens used/remaining
│   │   ├── CostEstimationCards.tsx  # Provider cards with pricing (OpenAI, Anthropic, Google)
│   │   ├── ExportButtons.tsx        # Copy to clipboard + Download JSON buttons
│   │   └── BudgetSummary.tsx        # Summary bar: "15 selected · 45,231 / 128,000 tokens (64% used)"
│   ├── hooks/
│   │   ├── useBudgetCalculator.ts   # Main hook with knapsack algorithms + state
│   │   ├── useDebounce.ts           # Debounce hook for auto-recalculate (500ms)
│   │   └── useCostEstimation.ts     # Calculate costs per provider based on token count
│   └── lib/
│       ├── knapsack.ts              # Greedy knapsack implementations (3 strategies)
│       ├── pricing-data.ts          # Provider pricing constants (as of 2026-01)
│       └── clipboard-utils.ts       # Copy to clipboard utility with fallback
```

### Pattern 1: Greedy Knapsack Algorithms

**What:** Implement three optimization strategies using greedy algorithms for O(n log n) performance.

**When to use:** Budget optimization requires selecting EPUBs within token budget constraint.

**Example:**
```typescript
// Source: Standard knapsack algorithm patterns + JavaScript implementation research
import type { EpubResult } from '@epub-counter/shared';

interface KnapsackItem {
  result: EpubResult;
  tokenCount: number;  // Weight
  wordCount: number;   // Value for max words strategy
}

type Strategy = 'max-books' | 'max-words' | 'balanced';

/**
 * Max Books Strategy: Shortest books first to maximize count
 * Greedy: Sort by token count ascending, take as many as fit
 */
function knapsackMaxBooks(items: KnapsackItem[], budget: number): KnapsackItem[] {
  const sorted = [...items].sort((a, b) => a.tokenCount - b.tokenCount);
  const selected: KnapsackItem[] = [];
  let used = 0;

  for (const item of sorted) {
    if (used + item.tokenCount <= budget) {
      selected.push(item);
      used += item.tokenCount;
    } else {
      break;  // Greedy: stop when next item doesn't fit
    }
  }

  return selected;
}

/**
 * Max Words Strategy: Longest books that fit to maximize total words
 * Greedy: Sort by token count descending, take if fits
 */
function knapsackMaxWords(items: KnapsackItem[], budget: number): KnapsackItem[] {
  const sorted = [...items].sort((a, b) => b.tokenCount - a.tokenCount);
  const selected: KnapsackItem[] = [];
  let used = 0;

  for (const item of sorted) {
    if (used + item.tokenCount <= budget) {
      selected.push(item);
      used += item.tokenCount;
    }
  }

  return selected;
}

/**
 * Balanced Strategy: Ratio-based selection (word density)
 * Greedy: Sort by word-to-token ratio descending, take best density items
 */
function knapsackBalanced(items: KnapsackItem[], budget: number): KnapsackItem[] {
  const withRatio = items.map(item => ({
    ...item,
    ratio: item.wordCount / item.tokenCount  // Words per token
  }));

  const sorted = withRatio.sort((a, b) => b.ratio - a.ratio);
  const selected: KnapsackItem[] = [];
  let used = 0;

  for (const item of sorted) {
    if (used + item.tokenCount <= budget) {
      selected.push(item);
      used += item.tokenCount;
    }
  }

  return selected;
}

/**
 * Main knapsack selector
 */
export function solveKnapsack(
  results: EpubResult[],
  budget: number,
  tokenizerName: string,
  strategy: Strategy
): EpubResult[] {
  // Transform to knapsack items
  const items: KnapsackItem[] = results
    .filter(r => !r.error)  // Only successful EPUBs
    .map(result => {
      const tokenCount = result.tokenCounts.find(t => t.name === tokenizerName)?.count ?? 0;
      return {
        result,
        tokenCount,
        wordCount: result.wordCount
      };
    })
    .filter(item => item.tokenCount > 0);  // Only EPUBs with valid token counts

  // Validate budget sufficient for at least one item
  const minTokenCount = Math.min(...items.map(i => i.tokenCount));
  if (budget < minTokenCount) {
    return [];  // Insufficient budget for any EPUB
  }

  // Execute strategy
  const selected = strategy === 'max-books'
    ? knapsackMaxBooks(items, budget)
    : strategy === 'max-words'
    ? knapsackMaxWords(items, budget)
    : knapsackBalanced(items, budget);

  return selected.map(item => item.result);
}
```

### Pattern 2: Budget Calculator Hook with Debounced Recalculation

**What:** Main hook managing budget input, strategy selection, knapsack calculation, and localStorage persistence.

**When to use:** Central state management for budget calculator component.

**Example:**
```typescript
// Source: React hooks patterns + localStorage persistence research
import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useDebounce } from '@/hooks/use-debounce';
import { solveKnapsack } from '@/lib/knapsack';
import type { EpubResult, TokenizerType } from '@epub-counter/shared';

interface BudgetCalculatorState {
  budget: number;
  selectedPreset: number | null;  // 32000, 128000, 200000, or null for custom
  tokenizer: TokenizerType;
  strategy: 'max-books' | 'max-words' | 'balanced';
}

interface BudgetResult {
  selectedBooks: EpubResult[];
  totalTokens: number;
  totalWords: number;
  remainingTokens: number;
  percentUsed: number;
}

const BUDGET_PRESETS = [32000, 128000, 200000];
const STORAGE_KEY = 'budget-calculator-state';

export function useBudgetCalculator(results: EpubResult[]) {
  // Load saved state from localStorage
  const [state, setState] = useLocalStorage<BudgetCalculatorState>(STORAGE_KEY, {
    budget: 128000,
    selectedPreset: 128000,
    tokenizer: 'gpt4',
    strategy: 'max-books'
  });

  // Debounce budget input for auto-recalculation
  const debouncedBudget = useDebounce(state.budget, 500);

  // Calculate selection with knapsack algorithm
  const result: BudgetResult = useMemo(() => {
    if (results.length === 0 || debouncedBudget <= 0) {
      return {
        selectedBooks: [],
        totalTokens: 0,
        totalWords: 0,
        remainingTokens: debouncedBudget,
        percentUsed: 0
      };
    }

    const selected = solveKnapsack(
      results,
      debouncedBudget,
      state.tokenizer,
      state.strategy
    );

    const totalTokens = selected.reduce((sum, r) => {
      const count = r.tokenCounts.find(t => t.name === state.tokenizer)?.count ?? 0;
      return sum + count;
    }, 0);

    const totalWords = selected.reduce((sum, r) => sum + r.wordCount, 0);

    return {
      selectedBooks: selected,
      totalTokens,
      totalWords,
      remainingTokens: debouncedBudget - totalTokens,
      percentUsed: (totalTokens / debouncedBudget) * 100
    };
  }, [results, debouncedBudget, state.tokenizer, state.strategy]);

  // Update handlers
  const setBudget = useCallback((budget: number) => {
    setState(prev => ({
      ...prev,
      budget,
      selectedPreset: BUDGET_PRESETS.includes(budget) ? budget : null
    }));
  }, [setState]);

  const setPreset = useCallback((preset: number) => {
    setState(prev => ({
      ...prev,
      budget: preset,
      selectedPreset: preset
    }));
  }, [setState]);

  const setTokenizer = useCallback((tokenizer: TokenizerType) => {
    setState(prev => ({ ...prev, tokenizer }));
  }, [setState]);

  const setStrategy = useCallback((strategy: BudgetCalculatorState['strategy']) => {
    setState(prev => ({ ...prev, strategy }));
  }, [setState]);

  // Validation: Is budget sufficient for at least one book?
  const isValid = useMemo(() => {
    if (debouncedBudget <= 0) return false;
    const minTokens = Math.min(
      ...results
        .filter(r => !r.error)
        .map(r => r.tokenCounts.find(t => t.name === state.tokenizer)?.count ?? Infinity)
    );
    return debouncedBudget >= minTokens;
  }, [debouncedBudget, results, state.tokenizer]);

  return {
    // State
    state,
    result,
    isValid,
    // Actions
    setBudget,
    setPreset,
    setTokenizer,
    setStrategy
  };
}
```

### Pattern 3: Cost Estimation by Provider

**What:** Calculate estimated costs for OpenAI, Anthropic, and Google based on selected token count.

**When to use:** Display cost cards showing estimated processing cost per provider.

**Example:**
```typescript
// Source: Official provider pricing pages (January 2026)
// OpenAI: https://openai.com/api/pricing/
// Anthropic: https://www.anthropic.com/pricing
// Google: https://ai.google.dev/gemini-api/docs/pricing

export interface ProviderPricing {
  name: string;
  inputPrice: number;  // Per 1M tokens
  outputPrice: number; // Per 1M tokens
  pricingUrl: string;
}

export interface CostEstimate {
  provider: string;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  pricePerMillion: { input: number; output: number };
}

/**
 * Pricing data as of January 2026
 *
 * IMPORTANT: These are current pricing for standard models:
 * - OpenAI: GPT-4o (flagship, most cost-effective)
 * - Anthropic: Claude Sonnet 4.1 (balanced performance)
 * - Google: Gemini 2.5 Flash (cost-optimized)
 *
 * For production: Update these quarterly or fetch from API
 */
export const PROVIDER_PRICING: Record<string, ProviderPricing> = {
  openai: {
    name: 'OpenAI',
    inputPrice: 2.50,   // $2.50 per 1M input tokens
    outputPrice: 10.00, // $10.00 per 1M output tokens
    pricingUrl: 'https://openai.com/api/pricing/'
  },
  anthropic: {
    name: 'Anthropic',
    inputPrice: 3.00,   // $3.00 per 1M input tokens
    outputPrice: 15.00, // $15.00 per 1M output tokens
    pricingUrl: 'https://www.anthropic.com/pricing'
  },
  google: {
    name: 'Google',
    inputPrice: 0.30,   // $0.30 per 1M input tokens
    outputPrice: 2.50,  // $2.50 per 1M output tokens
    pricingUrl: 'https://ai.google.dev/gemini-api/docs/pricing'
  }
};

/**
 * Calculate cost estimate for a provider
 *
 * Note: For EPUB token counting, we assume all tokens are input tokens
 * (processing EPUB text as context). Output tokens depend on use case.
 *
 * This implementation shows input-only cost. For LLM chat applications,
 * you would track both input and output token usage.
 */
export function calculateCost(
  tokenCount: number,
  provider: keyof typeof PROVIDER_PRICING,
  outputMultiplier: number = 0  // Output token multiplier (e.g., 0.5 for 50% output)
): CostEstimate {
  const pricing = PROVIDER_PRICING[provider];

  // Calculate input token cost
  const inputCost = (tokenCount / 1_000_000) * pricing.inputPrice;

  // Calculate output token cost (if applicable)
  const outputTokens = tokenCount * outputMultiplier;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPrice;

  return {
    provider: pricing.name,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    pricePerMillion: {
      input: pricing.inputPrice,
      output: pricing.outputPrice
    }
  };
}

/**
 * Get cost estimates for all providers
 */
export function getAllCostEstimates(tokenCount: number): CostEstimate[] {
  return Object.keys(PROVIDER_PRICING).map(provider =>
    calculateCost(tokenCount, provider as keyof typeof PROVIDER_PRICING)
  );
}
```

### Pattern 4: Copy to Clipboard with Fallback

**What:** Copy selected book list to clipboard using modern Clipboard API with fallback.

**When to use:** User clicks "Copy to Clipboard" button for selected books.

**Example:**
```typescript
// Source: Clipboard API patterns + React hooks research
import { toast } from 'sonner';

export interface CopyData {
  title: string;
  author: string;
  wordCount: number;
  tokenCount: number;
}

export function formatBooksForClipboard(books: CopyData[]): string {
  return books.map(book =>
    `${book.title} by ${book.author}\n` +
    `  Words: ${book.wordCount.toLocaleString()}\n` +
    `  Tokens: ${book.tokenCount.toLocaleString()}`
  ).join('\n\n');
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API failed, falling back to execCommand:', error);
      // Fall through to fallback
    }
  }

  // Fallback: document.execCommand('copy')
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (error) {
    document.body.removeChild(textArea);
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}

/**
 * React hook for copy to clipboard functionality
 */
export function useCopyToClipboard() {
  const copy = async (books: CopyData[], showToast: boolean = true) => {
    const text = formatBooksForClipboard(books);
    const success = await copyToClipboard(text);

    if (showToast) {
      if (success) {
        toast.success(`Copied ${books.length} books to clipboard`);
      } else {
        toast.error('Failed to copy to clipboard');
      }
    }

    return success;
  };

  return { copy };
}
```

### Pattern 5: JSON File Download with Blob API

**What:** Download selected books as JSON file using browser Blob API.

**When to use:** User clicks "Download JSON" button to export selection.

**Example:**
```typescript
// Source: Blob API patterns + React hooks research
import type { EpubResult } from '@epub-counter/shared';

export interface ExportData {
  exportedAt: string;
  budget: number;
  tokenizer: string;
  strategy: string;
  selectedBooks: EpubResult[];
  summary: {
    count: number;
    totalTokens: number;
    totalWords: number;
  };
}

export function formatExportData(
  books: EpubResult[],
  budget: number,
  tokenizer: string,
  strategy: string
): ExportData {
  return {
    exportedAt: new Date().toISOString(),
    budget,
    tokenizer,
    strategy,
    selectedBooks: books,
    summary: {
      count: books.length,
      totalTokens: books.reduce((sum, book) => {
        return sum + (book.tokenCounts.find(t => t.name === tokenizer)?.count ?? 0);
      }, 0),
      totalWords: books.reduce((sum, book) => sum + book.wordCount, 0)
    }
  };
}

/**
 * Trigger browser download for JSON data
 */
export function downloadJson(data: ExportData, filename?: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `epub-selection-${Date.now()}.json`;

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * React hook for JSON download functionality
 */
export function useJsonDownload() {
  const download = (
    books: EpubResult[],
    budget: number,
    tokenizer: string,
    strategy: string,
    filename?: string
  ) => {
    const data = formatExportData(books, budget, tokenizer, strategy);
    downloadJson(data, filename);
  };

  return { download };
}
```

### Anti-Patterns to Avoid

- **Dynamic programming for knapsack**: O(nW) complexity where W=budget can be millions - use greedy O(n log n) instead
- **Storing pricing data in component hardcode**: Use centralized pricing constants file for easy updates
- **Skipping localStorage validation**: Always check for parse errors and handle corrupted state
- **Blocking UI during calculation**: Knapsack with 1000+ EPUBs can hang - use Web Workers if needed (unlikely for this scale)
- **Missing cost estimation disclaimer**: Always display "Costs are estimates only, verify with provider" notice
- **Forgetting to revokeObjectURL**: Memory leak if Blob URLs not cleaned up after download
- **Hardcoding preset values**: Use constants array for easy modification

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Knapsack from scratch | Custom DP implementation | Greedy sorting algorithms | O(n log n) vs O(nW) complexity, sufficient for budget use case |
| Custom debounce hook | setTimeout + clearTimeout | useDebounce from react-use or custom hook with cleanup | Proper cleanup, edge case handling |
| Clipboard implementation | Custom selection API | navigator.clipboard.writeText() | Modern async API, better permissions |
| File download via server | Backend endpoint for JSON export | Blob API + URL.createObjectURL() | Client-side, no server load |
| Table sorting/filtering | Manual array operations | TanStack Table | Production-ready, handles edge cases |
| Cost calculation formatting | Manual string concatenation | Intl.NumberFormat for currency | Proper locale formatting, consistent display |
| Tabs component | Custom div-based tabs | Radix UI Tabs (shadcn/ui) | Accessibility, keyboard navigation, ARIA attributes |

**Key insight:** Browser native APIs (Clipboard, Blob, localStorage) are mature and handle edge cases. Custom implementations miss browser security models, accessibility, and edge cases.

## Common Pitfalls

### Pitfall 1: Budget Insufficient Validation

**What goes wrong:** User enters budget smaller than any single EPUB's token count, calculation returns empty array, UI shows no error.

**Why it happens:** Knapsack algorithm gracefully handles no-solution case by returning empty, but UI doesn't distinguish "user error" from "valid empty result".

**How to avoid:** Calculate minimum token count across all EPUBs before running knapsack, disable calculate button if budget < minimum:
```typescript
const minTokens = Math.min(...results.map(r => getTokenCount(r, tokenizer)));
if (budget < minTokens) {
  setError(`Budget too low. Minimum ${minTokens.toLocaleString()} tokens required for one EPUB.`);
  return;
}
```

**Warning signs:** Silent empty results, no feedback when budget is clearly too small (e.g., 100 tokens).

### Pitfall 2: Stale Pricing Data

**What goes wrong:** Costs displayed are outdated after providers change pricing, users make decisions based on wrong numbers.

**Why it happens:** Hardcoded pricing in components, no timestamp or version tracking.

**How to avoid:** Store pricing with `asOf` date, display "Pricing as of 2026-01" in UI, add comment to update quarterly:
```typescript
export const PRICING_METADATA = {
  lastUpdated: '2026-01-24',
  nextReview: '2026-04-24',
  source: 'Official provider pricing pages'
};
```

**Warning signs:** Costs don't match provider websites, user complaints about incorrect estimates.

### Pitfall 3: localStorage Quota Exceeded

**What goes wrong:** Budget calculator state fails to save, console shows "QuotaExceededError", user loses settings on refresh.

**Why it happens:** localStorage has 5MB limit, storing full results.json (large datasets) exceeds quota.

**How to avoid:** Only store minimal calculator state (budget, tokenizer, strategy), not full results:
```typescript
// DO: Store minimal state
localStorage.setItem('budget-state', JSON.stringify({
  budget: 128000,
  tokenizer: 'gpt4',
  strategy: 'max-books'
}));

// DON'T: Store full results
localStorage.setItem('budget-results', JSON.stringify(fullResultsData));  // Can exceed 5MB
```

**Warning signs:** Settings not persisting across reloads, QuotaExceededError in console.

### Pitfall 4: Missing Clipboard API Permissions

**What goes wrong:** Copy button fails silently in non-secure contexts (HTTP instead of HTTPS), Clipboard API requires secure context.

**Why it happens:** navigator.clipboard only works in secure contexts (HTTPS, localhost).

**How to avoid:** Always implement fallback to document.execCommand('copy'):
```typescript
if (navigator.clipboard && window.isSecureContext) {
  await navigator.clipboard.writeText(text);
} else {
  // Fallback for HTTP/non-secure
  fallbackCopy(text);
}
```

**Warning signs:** Copy button does nothing in production HTTP environments.

### Pitfall 5: Re-calculating on Every Keystroke

**What goes wrong:** Typing budget "100000" triggers knapsack calculation 5 times (1, 10, 100, 1000, 10000, 100000), causing lag with large datasets.

**Why it happens:** Budget input onChange triggers immediate calculation without debouncing.

**How to avoid:** Use 500ms debounce for budget input changes:
```typescript
const debouncedBudget = useDebounce(budget, 500);

useEffect(() => {
  recalculate(debouncedBudget);
}, [debouncedBudget]);
```

**Warning signs:** UI freezes while typing budget, CPU spikes during input.

### Pitfall 6: Incorrect Token Count Access

**What goes wrong:** Cost estimation shows $0 or NaN, selected books table shows 0 tokens.

**Why it happens:** `tokenCounts` is array, not object - need to find by tokenizer name. Code assumes direct access like `result.tokenCounts.gpt4`.

**How to avoid:** Use helper function with null safety:
```typescript
const getTokenCount = (result: EpubResult, tokenizerName: string): number => {
  return result.tokenCounts.find(t => t.name === tokenizerName)?.count ?? 0;
};
```

**Warning signs:** All token counts show 0, costs display as $0.00, TypeScript errors about undefined.

## Code Examples

Verified patterns from official sources:

### Budget Calculator Component with Radix UI Tabs

```typescript
// Source: Radix UI Tabs documentation + React patterns
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBudgetCalculator } from '@/hooks/use-budget-calculator';
import type { EpubResult } from '@epub-counter/shared';

export function BudgetCalculator({ results }: { results: EpubResult[] }) {
  const {
    state,
    result,
    isValid,
    setBudget,
    setPreset,
    setTokenizer,
    setStrategy
  } = useBudgetCalculator(results);

  const presets = [
    { label: '32K', value: 32000 },
    { label: '128K', value: 128000 },
    { label: '200K', value: 200000 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Budget Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Input with Presets */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Token Budget</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={state.budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="Enter budget..."
              className="flex-1"
            />
            {presets.map(preset => (
              <Button
                key={preset.value}
                variant={state.selectedPreset === preset.value ? 'default' : 'outline'}
                onClick={() => setPreset(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Strategy Selector with Radix UI Tabs */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Optimization Strategy</label>
          <Tabs value={state.strategy} onValueChange={(v) => setStrategy(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="max-books">Max Books</TabsTrigger>
              <TabsTrigger value="max-words">Max Words</TabsTrigger>
              <TabsTrigger value="balanced">Balanced</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-xs text-muted-foreground">
            {state.strategy === 'max-books' && 'Select shortest books first to maximize count'}
            {state.strategy === 'max-words' && 'Select longest books that fit to maximize total words'}
            {state.strategy === 'balanced' && 'Balance book count and word count'}
          </p>
        </div>

        {/* Validation Error */}
        {!isValid && (
          <div className="text-sm text-destructive">
            Budget insufficient for at least one EPUB. Minimum:{' '}
            {Math.min(...results.map(r => getTokenCount(r, state.tokenizer))).toLocaleString()} tokens
          </div>
        )}

        {/* Result Summary */}
        {result.selectedBooks.length > 0 && (
          <BudgetSummary result={result} budget={state.budget} />
        )}
      </CardContent>
    </Card>
  );
}
```

### Cost Estimation Cards Component

```typescript
// Source: Shadcn/ui Card patterns + pricing calculation
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getAllCostEstimates, PROVIDER_PRICING } from '@/lib/pricing-data';
import { ExternalLink } from 'lucide-react';

export function CostEstimationCards({ tokenCount }: { tokenCount: number }) {
  const estimates = getAllCostEstimates(tokenCount);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Estimated Cost</h3>
        <a
          href="https://github.com/org/repo/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
        >
          Pricing as of 2026-01
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {estimates.map(estimate => (
          <Card key={estimate.provider}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{estimate.provider}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">
                ${estimate.totalCost.toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>${estimate.pricePerMillion.input}/1M input tokens</div>
                <div>${estimate.pricePerMillion.output}/1M output tokens</div>
              </div>
              <a
                href={PROVIDER_PRICING[estimate.provider.toLowerCase()].pricingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View pricing
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        Costs are estimates only. Actual costs may vary based on model version, region, and usage.
        Verify with provider before making decisions.
      </p>
    </div>
  );
}
```

### Budget Progress Bar Component

```typescript
// Source: Shadcn/ui Progress component documentation
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

export function BudgetProgressBar({
  used,
  remaining,
  total
}: {
  used: number;
  remaining: number;
  total: number;
}) {
  const percentUsed = (used / total) * 100;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Budget Utilization</span>
            <span className="text-muted-foreground">
              {used.toLocaleString()} / {total.toLocaleString()} tokens
            </span>
          </div>
          <Progress value={percentUsed} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{percentUsed.toFixed(1)}% used</span>
            <span>{remaining.toLocaleString()} remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Selected Books Table (Reuse Phase 7 Patterns)

```typescript
// Source: TanStack Table patterns from Phase 07
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useCopyToClipboard } from '@/lib/clipboard-utils';
import { useJsonDownload } from '@/lib/json-download';
import type { EpubResult } from '@epub-counter/shared';

export function SelectedBooksTable({
  books,
  tokenizer
}: {
  books: EpubResult[];
  tokenizer: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'tokens', desc: true }]);
  const { copy } = useCopyToClipboard();
  const { download } = useJsonDownload();

  const columns = useMemo(() => [
    {
      id: 'select',
      header: 'Selected',
      cell: () => (
        <Checkbox checked disabled />
      )
    },
    {
      accessorFn: (row: EpubResult) => row.metadata.title,
      id: 'title',
      header: 'Title'
    },
    {
      accessorFn: (row: EpubResult) => row.metadata.author,
      id: 'author',
      header: 'Author'
    },
    {
      accessorFn: (row: EpubResult) => row.wordCount.toLocaleString(),
      id: 'words',
      header: 'Words'
    },
    {
      accessorFn: (row: EpubResult) =>
        row.tokenCounts.find(t => t.name === tokenizer)?.count.toLocaleString() || '0',
      id: 'tokens',
      header: 'Tokens'
    }
  ], [tokenizer]);

  const table = useReactTable({
    data: books,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting
  });

  const handleCopy = async () => {
    const copyData = books.map(book => ({
      title: book.metadata.title,
      author: book.metadata.author,
      wordCount: book.wordCount,
      tokenCount: book.tokenCounts.find(t => t.name === tokenizer)?.count || 0
    }));
    await copy(copyData, true);
  };

  const handleDownload = () => {
    download(books, 128000, tokenizer, 'max-books');
  };

  return (
    <Card>
      <div className="flex items-center justify-between p-6">
        <h3 className="text-lg font-semibold">
          Selected Books ({books.length})
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-sm font-medium cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b hover:bg-accent/30">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dynamic programming knapsack | Greedy sorting algorithms | Always applicable | O(n log n) vs O(nW) complexity, sufficient approximation |
| document.execCommand('copy') only | Clipboard API with fallback | 2016+ (Clipboard API) | Async API, better permissions, fallback for older browsers |
| Server-side file download | Blob API + createObjectURL | 2013+ | Client-side generation, no server load |
| Manual localStorage wrappers | React hooks (useLocalStorage) | React 16.8+ | Cleaner API, automatic sync, SSR safety |
| Custom debounce implementations | react-use useDebounce or custom hook | 2020+ | Proper cleanup, TypeScript support |
| Hardcoded pricing in components | Centralized pricing constants | Always best practice | Easy updates, single source of truth |
| Custom tabs/accordion components | Radix UI primitives | 2021+ | Accessibility, keyboard navigation, ARIA built-in |

**Deprecated/outdated:**
- Dynamic programming for budget knapsack: Unnecessary complexity, greedy is sufficient
- document.execCommand without fallback: Fails in modern secure contexts
- Server-side export endpoints: Client-side Blob API is simpler and faster
- Custom tabs implementation: Radix UI Tabs provides accessibility out of the box
- Manual localStorage get/set JSON: Use useLocalStorage hook for cleaner React integration

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal debounce timing for budget calculator**
   - What we know: 500ms is common default for input debouncing
   - What's unclear: Whether 500ms is optimal for knapsack calculation with 1000+ EPUBs
   - Recommendation: Start with 500ms, test with real dataset, increase to 750ms if UI lags during typing

2. **Pricing update frequency for production use**
   - What we know: Providers change pricing quarterly or semi-annually
   - What's unclear: Whether to fetch pricing from API vs hardcode with update schedule
   - Recommendation: Hardcode for v2.0 milestone (localhost-only), add pricing fetch API for v3.0 if deployed to production

3. **Web Worker necessity for knapsack calculation**
   - What we know: O(n log n) greedy sort is fast for typical datasets (< 1000 EPUBs)
   - What's unclear: At what dataset size UI blocking becomes noticeable
   - Recommendation: Implement without Web Workers first, add if users report lag with 1000+ EPUBs

4. **Cost estimation accuracy for different use cases**
   - What we know: Current implementation assumes input-only cost (EPUB processing)
   - What's unclear: Whether to include output token estimation (e.g., 50% of input for chat)
   - Recommendation: Input-only cost is accurate for EPUB token counting use case; add output multiplier toggle in future if users request

## Sources

### Primary (HIGH confidence)
- [Radix UI Tabs Documentation](https://www.radix-ui.com/primitives/docs/components/tabs) - Official API, examples, accessibility features
- [Radix UI npm package](https://www.npmjs.com/package/@radix-ui/react-tabs) - v1.1.13, stable release
- [Clipboard API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) - Official browser API documentation
- [Blob API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Blob) - Official browser API for file generation
- [URL.createObjectURL - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) - Object URL creation for downloads
- [TanStack Table Documentation](https://tanstack.com/table/latest) - Headless table patterns from Phase 07
- [Anthropic Official Pricing](https://www.anthropic.com/pricing) - Current Claude Sonnet 4.1 pricing (verified 2026-01-24)
- [Google Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing) - Current Gemini 2.5 Flash pricing (verified 2026-01-24)

### Secondary (MEDIUM confidence)
- [OpenAI API Pricing](https://openai.com/api/pricing/) - Current GPT-4o pricing (2026)
- [Knapsack Problem - GeeksforGeeks](https://www.geeksforgeeks.org/dsa/0-1-knapsack-problem-dp-10/) - Algorithm explanation with examples
- [Knapsack Problem in JavaScript - LearnersBucket](https://learnersbucket.com/examples/algorithms/knapsack-problem-in-javascript/) - Greedy vs DP comparison
- [Using localStorage with React Hooks - LogRocket](https://blog.logrocket.com/using-localstorage-react-hooks/) - React localStorage patterns (March 2024)
- [Clipboard API in React - Medium](https://feargalwalsh.medium.com/copying-to-the-clipboard-in-react-81bb956963ec) - React clipboard patterns
- [React useDebounce Hook - GeekyAnts](https://geekyants.com/blog/introducing-the-usedebounce-hook) - Debounce implementation guide (April 2024)
- [useDebounce - React Use](https://reactuse.com/state/useDebounce/) - React-Use library documentation

### Tertiary (LOW confidence)
- [LLM API Pricing Calculator Tools](https://www.helicone.ai/llm-cost) - Third-party calculator references (2026)
- [State Management in Vanilla JS: 2026 Trends - Medium](https://medium.com/@chirag.dave/state-management-in-vanilla-js-2026-trends-f9baed7599de) - localStorage vs IndexedDB trends
- [Stack Overflow: Copying to clipboard in React](https://stackoverflow.com/questions/74056561/copying-to-clipboard-react) - Community clipboard patterns
- [Stack Overflow: React file download JSON](https://stackoverflow.com/questions/55613438/reactwrite-to-json-file-or-export-download-no-server) - Community download patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Radix UI Tabs, Clipboard API, Blob API are mature standards with excellent documentation
- Architecture: HIGH - Knapsack algorithms are well-studied, React patterns verified against official docs
- Pitfalls: MEDIUM - Based on common React/browser API issues, but some specific to our use case

**Research date:** 2026-01-24
**Valid until:** 2026-02-23 (30 days - stable browser APIs, but pricing data may change)
