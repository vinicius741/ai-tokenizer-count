/**
 * JSON Output Module
 *
 * Generates JSON output with word_count per EPUB (OUT-04 requirement).
 * Creates structured results file with summary, successful EPUBs, and failed files.
 * Extended to include token_counts array and schema_version field (02-03 requirement).
 */

import fs from 'fs/promises';
import path from 'path';
import type { ProcessingResult } from '../errors/handler.js';
import type { TokenizerResult } from '../tokenizers/types.js';

/**
 * Single EPUB result for JSON output
 */
export interface EpubJsonResult {
  /** Filename of the EPUB */
  filename: string;
  /** Absolute path to the EPUB file */
  file_path: string;
  /** Title of the EPUB */
  title: string;
  /** Author of the EPUB */
  author: string;
  /** Word count (OUT-04 requirement) */
  word_count: number;
  /** Language code (optional) */
  language?: string;
  /** Publisher name (optional) */
  publisher?: string;
  /** Token counts per tokenizer (02-03 requirement) */
  token_counts?: TokenizerResult[];
  /** Schema version for output format (02-03 requirement) */
  schema_version?: string;
}

/**
 * JSON output generation options
 */
export interface JsonOutputOptions {
  /** Output directory path (default: './results' per CFG-02, accepts custom path for CLI-05) */
  outputDir: string;
  /** Output filename (default: 'results.json') */
  filename: string;
}

/**
 * Generate JSON output from processing result
 *
 * Creates structured object with:
 * - Schema version (02-03 requirement)
 * - Generated timestamp
 * - Summary statistics (total, successful, failed)
 * - Array of successful EPUBs with word_count (OUT-04) and token_counts (02-03)
 * - Array of failed files with error details
 *
 * @param result - Processing result from processEpubsWithErrors
 * @param timestamp - ISO 8601 timestamp
 * @param tokenCounts - Optional map of filename to token_counts array
 * @returns Structured JSON object
 */
export function generateJsonOutput(
  result: ProcessingResult,
  timestamp: string,
  tokenCounts?: Map<string, TokenizerResult[]>
): object {
  return {
    schema_version: '1.0',
    generated_at: timestamp,
    summary: {
      total: result.total,
      successful: result.successful.length,
      failed: result.failed.length,
    },
    epubs: result.successful.map((epub) => {
      const epubResult: any = {
        filename: epub.filename,
        file_path: epub.file_path || epub.filename,
        title: epub.title,
        author: epub.author,
        word_count: epub.wordCount, // OUT-04 requirement
        language: epub.language,
        publisher: epub.publisher,
      };

      // Add token_counts if available (02-03 requirement)
      if (tokenCounts && tokenCounts.has(epub.filename)) {
        epubResult.token_counts = tokenCounts.get(epub.filename);
      }

      return epubResult;
    }),
    failed: result.failed.map((f) => ({
      file: f.file,
      error: f.error,
      suggestion: f.suggestion,
    })),
  };
}

/**
 * Write JSON results file to output directory
 *
 * Creates output directory if it doesn't exist.
 * Generates JSON content and writes to file.
 *
 * @param result - Processing result from processEpubsWithErrors
 * @param options - Output options (default: { outputDir: './results', filename: 'results.json' })
 * @param tokenCounts - Optional map of filename to token_counts array (02-03 requirement)
 * @returns Absolute path to written file
 *
 * @example
 * ```ts
 * // Basic usage
 * const jsonPath = await writeJsonFile(result, {
 *   outputDir: './results',
 *   filename: 'results.json'
 * });
 *
 * // With token counts
 * const tokenCounts = new Map([['book.epub', [{ name: 'gpt4', count: 1234 }]]);
 * const jsonPath = await writeJsonFile(result, { outputDir: './results' }, tokenCounts);
 * console.log(`JSON written to: ${jsonPath}`);
 * ```
 */
export async function writeJsonFile(
  result: ProcessingResult,
  options: Partial<JsonOutputOptions> = {},
  tokenCounts?: Map<string, TokenizerResult[]>
): Promise<string> {
  // Default options
  const opts: JsonOutputOptions = {
    outputDir: options.outputDir || './results',
    filename: options.filename || 'results.json',
  };

  // Ensure output directory exists
  await fs.mkdir(opts.outputDir, { recursive: true });

  // Generate JSON content with optional token counts
  const content = generateJsonOutput(result, new Date().toISOString(), tokenCounts);

  // Write to file
  const filePath = path.join(opts.outputDir, opts.filename);
  await fs.writeFile(filePath, JSON.stringify(content, null, 2));

  // Return absolute path
  return path.resolve(filePath);
}
