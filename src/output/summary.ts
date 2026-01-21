/**
 * Summary Statistics Display
 *
 * Provides comprehensive summary statistics after batch processing.
 * Displays aggregated metrics (total EPUBs, words, tokens, timing) in
 * professional sectioned tables using cli-table3.
 */

import Table from 'cli-table3';
import type { EpubResult } from './table.js';
import type { TokenizerResult } from '../tokenizers/types.js';

/**
 * Summary statistics for batch processing
 */
export interface SummaryStats {
  /** Total EPUBs processed (successful + failed) */
  totalEpubs: number;
  /** Number of successfully processed EPUBs */
  successfulEpubs: number;
  /** Number of failed EPUBs */
  failedEpubs: number;
  /** Total word count across all successful EPUBs */
  totalWords: number;
  /** Average word count per successful EPUB */
  avgWordsPerEpub: number;
  /** Total tokens per tokenizer (tokenizer name -> total count) */
  totalTokens: Map<string, number>;
  /** Average tokens per EPUB per tokenizer (tokenizer name -> average) */
  avgTokensPerEpub: Map<string, number>;
  /** Total processing time in milliseconds */
  totalTimeMs: number;
  /** Average processing time per EPUB in milliseconds */
  avgTimePerEpubMs: number;
  /** Fastest EPUB processed (filename and time) */
  fastestEpub: { filename: string; timeMs: number } | null;
  /** Slowest EPUB processed (filename and time) */
  slowestEpub: { filename: string; timeMs: number } | null;
  /** List of failed files with error messages */
  failures: Array<{ file: string; error: string }>;
}

/**
 * Calculate summary statistics from processing results
 *
 * Aggregates metrics from successful/failed EPUBs, token counts, and timing.
 * Skips token counts of -1 (errors) and 0 (empty) when calculating averages.
 *
 * @param successful - Array of successfully processed EPUB results
 * @param failed - Array of failed EPUB results with error messages
 * @param tokenCounts - Map of filename to tokenizer results
 * @param startTime - Start time in milliseconds (from Date.now())
 * @returns Summary statistics object
 *
 * @example
 * ```ts
 * const summary = calculateSummary(
 *   successfulResults,
 *   failedResults,
 *   tokenCountsMap,
 *   startTime
 * );
 * console.log(`Total words: ${summary.totalWords}`);
 * ```
 */
export function calculateSummary(
  successful: EpubResult[],
  failed: Array<{ file: string; error: string; suggestion?: string }>,
  tokenCounts: Map<string, TokenizerResult[]>,
  startTime: number
): SummaryStats {
  const endTime = Date.now();
  const totalTimeMs = endTime - startTime;

  // Count totals
  const totalEpubs = successful.length + failed.length;
  const successfulEpubs = successful.length;
  const failedEpubs = failed.length;

  // Word counts
  const totalWords = successful.reduce((sum, r) => sum + r.wordCount, 0);
  const avgWordsPerEpub = successfulEpubs > 0 ? Math.round(totalWords / successfulEpubs) : 0;

  // Token counts (aggregate per tokenizer)
  const totalTokens = new Map<string, number>();
  const avgTokensPerEpub = new Map<string, number>();

  // Get all tokenizer names from results
  const tokenizerNames = new Set<string>();
  for (const counts of tokenCounts.values()) {
    for (const t of counts) {
      tokenizerNames.add(t.name);
    }
  }

  // Aggregate totals per tokenizer
  for (const name of tokenizerNames) {
    let sum = 0;
    let count = 0;

    for (const counts of tokenCounts.values()) {
      const result = counts.find((t) => t.name === name);
      // Skip -1 (errors) and 0 (empty) when calculating averages
      if (result && result.count > 0) {
        sum += result.count;
        count++;
      }
    }

    totalTokens.set(name, sum);
    avgTokensPerEpub.set(name, count > 0 ? Math.round(sum / count) : 0);
  }

  // Timing
  const avgTimePerEpubMs = totalEpubs > 0 ? Math.round(totalTimeMs / totalEpubs) : 0;

  // Fastest/slowest (placeholder - requires per-file timing)
  const fastestEpub = null;
  const slowestEpub = null;

  // Failures
  const failures = failed.map((f) => ({ file: f.file, error: f.error }));

  return {
    totalEpubs,
    successfulEpubs,
    failedEpubs,
    totalWords,
    avgWordsPerEpub,
    totalTokens,
    avgTokensPerEpub,
    totalTimeMs,
    avgTimePerEpubMs,
    fastestEpub,
    slowestEpub,
    failures,
  };
}

/**
 * Display summary statistics in formatted tables
 *
 * Shows three sectioned blocks:
 * - Overview: Total EPUBs, successful, failed, word counts, timing
 * - Tokenizer Statistics: Total and average tokens per tokenizer
 * - Failures: List of failed files with error messages (if any)
 *
 * Uses emojis for section headers (📊, 🔢, ❌) for visual clarity.
 * Formats numbers with locale strings (1,234,567) and durations (1m 23.4s).
 *
 * @param stats - Summary statistics to display
 *
 * @example
 * ```ts
 * const summary = calculateSummary(...);
 * displaySummary(summary);
 * ```
 */
export function displaySummary(stats: SummaryStats): void {
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY STATISTICS');
  console.log('='.repeat(60));

  // Overview table
  const overviewTable = new Table({
    head: ['Metric', 'Value'],
    colWidths: [30, 28],
    wordWrap: true,
    style: {
      head: ['cyan', 'bold'],
      border: ['grey'],
    },
  });

  overviewTable.push(
    ['Total EPUBs processed', stats.totalEpubs.toString()],
    ['Successful', stats.successfulEpubs.toString()],
    ['Failed', stats.failedEpubs.toString()],
    ['Total words', stats.totalWords.toLocaleString()],
    ['Average words/EPUB', stats.avgWordsPerEpub.toLocaleString()],
    ['Total time', formatDuration(stats.totalTimeMs)],
    ['Average time/EPUB', formatDuration(stats.avgTimePerEpubMs)],
  );

  console.log('\n📊 Overview');
  console.log(overviewTable.toString());

  // Tokenizer statistics table
  if (stats.totalTokens.size > 0) {
    const tokenTable = new Table({
      head: ['Tokenizer', 'Total Tokens', 'Avg Tokens/EPUB'],
      colWidths: [20, 20, 20],
      wordWrap: true,
      style: {
        head: ['cyan', 'bold'],
        border: ['grey'],
      },
    });

    for (const [name, total] of stats.totalTokens.entries()) {
      const avg = stats.avgTokensPerEpub.get(name) || 0;
      tokenTable.push([name, total.toLocaleString(), avg.toLocaleString()]);
    }

    console.log('\n🔢 Tokenizer Statistics');
    console.log(tokenTable.toString());
  }

  // Failures table
  if (stats.failures.length > 0) {
    const failureTable = new Table({
      head: ['File', 'Error'],
      colWidths: [40, 40],
      wordWrap: true,
      style: {
        head: ['red', 'bold'],
        border: ['grey'],
      },
    });

    for (const failure of stats.failures) {
      const filename = failure.file.split('/').pop() || failure.file;
      failureTable.push([filename, failure.error]);
    }

    console.log('\n❌ Failures');
    console.log(failureTable.toString());
  }

  console.log('');
}

/**
 * Format milliseconds as human-readable duration
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "123ms", "5.2s", "1m 23.4s")
 *
 * @example
 * ```ts
 * formatDuration(500);    // "500ms"
 * formatDuration(1500);   // "1.5s"
 * formatDuration(65000);  // "1m 5.0s"
 * ```
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const mins = Math.floor(ms / 60000);
    const secs = ((ms % 60000) / 1000).toFixed(1);
    return `${mins}m ${secs}s`;
  }
}
