/**
 * Budget Calculator Hook
 *
 * Main hook for budget optimization using knapsack algorithm.
 * Manages budget calculator state with localStorage persistence and
 * memoized calculations for performance.
 */

import { useMemo, useCallback } from 'react';
import type { EpubResult } from '@epub-counter/shared';
import { useLocalStorage } from './use-local-storage';
import { useDebounce } from './use-debounce';
import { solveKnapsack } from '../lib/knapsack';

/**
 * Budget calculator state
 */
export interface BudgetCalculatorState {
  /** Token budget */
  budget: number;
  /** Selected budget preset (if any) */
  selectedPreset: number | null;
  /** Selected tokenizer */
  tokenizer: string;
  /** Optimization strategy */
  strategy: 'max-books' | 'max-words' | 'balanced';
}

/**
 * Budget calculation result
 */
export interface BudgetResult {
  /** Selected EPUB results */
  selectedBooks: EpubResult[];
  /** Total tokens for selected books */
  totalTokens: number;
  /** Total words for selected books */
  totalWords: number;
  /** Remaining tokens in budget */
  remainingTokens: number;
  /** Percentage of budget used */
  percentUsed: number;
}

/**
 * Budget preset options
 */
export const BUDGET_PRESETS = [32000, 128000, 200000] as const;

/**
 * Local storage key for budget calculator state
 */
const STORAGE_KEY = 'budget-calculator-state';

/**
 * Default state for budget calculator
 */
const DEFAULT_STATE: BudgetCalculatorState = {
  budget: 128000,
  selectedPreset: 128000,
  tokenizer: 'gpt4',
  strategy: 'max-books',
};

/**
 * Main budget calculator hook
 *
 * Manages budget calculator state with localStorage persistence and
 * performs knapsack optimization to select EPUBs within budget.
 *
 * @param results - Epub results to optimize
 * @returns Calculator state, result, validation, and setters
 */
export function useBudgetCalculator(results: EpubResult[]) {
  // Load state from localStorage with defaults
  const [state, setState] = useLocalStorage<BudgetCalculatorState>(
    STORAGE_KEY,
    DEFAULT_STATE
  );

  // Debounce budget for 500ms to avoid excessive recalculations
  const debouncedBudget = useDebounce(state.budget, 500);

  // Calculate knapsack result
  const result = useMemo<BudgetResult>(() => {
    // Return empty result if no results or invalid budget
    if (results.length === 0 || debouncedBudget <= 0) {
      return {
        selectedBooks: [],
        totalTokens: 0,
        totalWords: 0,
        remainingTokens: debouncedBudget > 0 ? debouncedBudget : 0,
        percentUsed: 0,
      };
    }

    // Solve knapsack with current settings
    const selectedBooks = solveKnapsack(
      results,
      debouncedBudget,
      state.tokenizer,
      state.strategy
    );

    // Calculate totals from selected books
    const totalTokens = selectedBooks.reduce((sum, book) => {
      const tokenCount = book.tokenCounts.find(t => t.name === state.tokenizer)?.count ?? 0;
      return sum + tokenCount;
    }, 0);

    const totalWords = selectedBooks.reduce((sum, book) => sum + book.wordCount, 0);

    const remainingTokens = debouncedBudget - totalTokens;
    const percentUsed = debouncedBudget > 0 ? (totalTokens / debouncedBudget) * 100 : 0;

    return {
      selectedBooks,
      totalTokens,
      totalWords,
      remainingTokens,
      percentUsed,
    };
  }, [results, debouncedBudget, state.tokenizer, state.strategy]);

  // Check if budget is valid (greater than 0 and sufficient for at least one book)
  const isValid = useMemo(() => {
    if (debouncedBudget <= 0) return false;

    // Check if at least one book has a token count <= budget
    const minTokenCount = Math.min(
      ...results
        .filter((r) => !r.error)
        .map((r) => r.tokenCounts.find(t => t.name === state.tokenizer)?.count ?? 0)
        .filter((count) => count > 0)
    );

    return debouncedBudget >= minTokenCount || results.length === 0;
  }, [debouncedBudget, results, state.tokenizer]);

  // Set budget and update selected preset if matches
  const setBudget = useCallback((budget: number) => {
    setState((prev) => {
      const matchingPreset = BUDGET_PRESETS.find((preset) => preset === budget);
      return {
        ...prev,
        budget,
        selectedPreset: matchingPreset ?? null,
      };
    });
  }, [setState]);

  // Set budget preset
  const setPreset = useCallback((preset: number) => {
    setState((prev) => ({
      ...prev,
      budget: preset,
      selectedPreset: preset,
    }));
  }, [setState]);

  // Set tokenizer
  const setTokenizer = useCallback((tokenizer: string) => {
    setState((prev) => ({
      ...prev,
      tokenizer,
    }));
  }, [setState]);

  // Set strategy
  const setStrategy = useCallback((strategy: 'max-books' | 'max-words' | 'balanced') => {
    setState((prev) => ({
      ...prev,
      strategy,
    }));
  }, [setState]);

  return {
    state,
    result,
    isValid,
    setBudget,
    setPreset,
    setTokenizer,
    setStrategy,
  };
}
