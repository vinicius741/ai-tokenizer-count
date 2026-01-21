/**
 * Parallel EPUB Processing Module
 *
 * Provides parallel processing of EPUB files using p-limit for
 * concurrency control. CPU-aware default job count (CPU count - 1)
 * ensures optimal resource utilization without overwhelming the system.
 *
 * Usage:
 *   const jobs = getJobCount('4');  // or undefined for default
 *   const result = await processInParallel(files, jobs, multibar);
 */

import os from 'os';
import pLimit from 'p-limit';
import path from 'path';
import { processEpubsWithErrors } from '../errors/handler.js';
import { createBar } from '../cli/progress.js';
import type { MultiBar } from 'cli-progress';
import type { EpubResult } from '../output/table.js';
import type { TokenizerResult } from '../tokenizers/types.js';

/**
 * Result from parallel EPUB processing
 */
export interface ParallelProcessingResult {
  /** Successfully processed EPUB files */
  successful: EpubResult[];
  /** Failed EPUB files with error details */
  failed: Array<{ file: string; error: string; suggestion?: string }>;
  /** Total number of files processed */
  total: number;
  /** Token counts per EPUB file */
  tokenCounts: Map<string, TokenizerResult[]>;
}

/**
 * Get job count from --jobs flag with CPU-aware default
 *
 * Supports:
 * - undefined: Returns CPU count - 1 (default)
 * - "all": Returns all CPU cores
 * - number: Returns specified job count
 *
 * Warns if job count > 32 (diminishing returns).
 * Falls back to 1 if os.cpus() returns undefined/empty (containers/CI).
 *
 * @param jobsFlag - Value from --jobs flag (number, "all", or undefined)
 * @returns Number of parallel jobs to run
 * @throws Error if jobsFlag is invalid (not a number or "all")
 *
 * @example
 * ```ts
 * getJobCount();           // Returns CPU count - 1 (e.g., 7 on 8-core system)
 * getJobCount('all');      // Returns all CPU cores (e.g., 8)
 * getJobCount('4');        // Returns 4
 * getJobCount('invalid');  // Throws Error
 * ```
 */
export function getJobCount(jobsFlag?: string): number {
  const cpus = os.cpus();
  const cpuCount = cpus?.length || 1; // Fallback for containers/CI

  if (!jobsFlag) {
    // Default: CPU count - 1 (leave one core for system)
    return Math.max(1, cpuCount - 1);
  }

  if (jobsFlag === 'all') {
    return cpuCount;
  }

  const parsed = parseInt(jobsFlag, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`--jobs must be a positive number or "all", got "${jobsFlag}"`);
  }

  // Warn if >32 jobs (diminishing returns)
  if (parsed > 32) {
    console.warn(
      `Warning: --jobs=${parsed} is unusually high. ` +
      `Consider using "all" (${cpuCount} cores) or a lower value.`
    );
  }

  return parsed;
}

/**
 * Process EPUB files in parallel with progress tracking
 *
 * Uses p-limit for concurrency control, ensuring only `jobCount` EPUBs
 * are processed simultaneously. Each parallel job creates its own progress
 * bar for real-time feedback.
 *
 * Progress bars are created dynamically as jobs start (not upfront),
 * which provides better UX for large batches and is essential for
 * parallel workflows.
 *
 * @param filePaths - Array of EPUB file paths to process
 * @param jobCount - Number of parallel jobs to run
 * @param multibar - MultiBar instance for progress display
 * @param verbose - Enable verbose output (default: false)
 * @param outputDir - Output directory for error logs (default: './results')
 * @param tokenizerNames - Tokenizer names to use (default: ['gpt4'])
 * @param maxMb - Maximum EPUB size in MB (default: 500)
 * @returns Promise resolving to processing results
 *
 * @example
 * ```ts
 * const multibar = createProgressBars();
 * const result = await processInParallel(
 *   ['book1.epub', 'book2.epub'],
 *   4,
 *   multibar,
 *   false,
 *   './results',
 *   ['gpt4', 'claude'],
 *   500
 * );
 * console.log(`Processed ${result.successful.length} of ${result.total} files`);
 * ```
 */
export async function processInParallel(
  filePaths: string[],
  jobCount: number,
  multibar: MultiBar,
  verbose: boolean = false,
  outputDir: string = './results',
  tokenizerNames: string[] = ['gpt4'],
  maxMb: number = 500
): Promise<ParallelProcessingResult> {
  // Create concurrency limiter
  const limit = pLimit(jobCount);

  // Aggregate results
  const allSuccessful: EpubResult[] = [];
  const allFailed: Array<{ file: string; error: string; suggestion?: string }> = [];
  const allTokenCounts = new Map<string, TokenizerResult[]>();

  // Create tasks for each file
  const tasks = filePaths.map((filePath) => {
    return limit(async () => {
      const filename = path.basename(filePath);

      // Create individual progress bar for this job
      const bar = createBar(multibar, filename);

      try {
        // Process single file
        const result = await processEpubsWithErrors(
          [filePath],
          verbose,
          outputDir,
          tokenizerNames,
          maxMb
        );

        // Update progress to 100% (complete)
        bar.update(100);

        return result;
      } catch (error) {
        // FATAL error - bar stays at current progress
        throw error;
      }
    });
  });

  // Wait for all tasks to complete
  const results = await Promise.all(tasks);

  // Aggregate results from all tasks
  for (const result of results) {
    allSuccessful.push(...result.successful);
    allFailed.push(...result.failed);
    // Merge tokenCounts maps
    for (const [filename, counts] of result.tokenCounts.entries()) {
      allTokenCounts.set(filename, counts);
    }
  }

  return {
    successful: allSuccessful,
    failed: allFailed,
    total: filePaths.length,
    tokenCounts: allTokenCounts,
  };
}
