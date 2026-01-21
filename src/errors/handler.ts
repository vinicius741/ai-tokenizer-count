/**
 * Error Handling Module
 *
 * Provides continue-on-error behavior for EPUB processing.
 * When one EPUB file fails to parse, processing continues for remaining files.
 * Errors are logged to both stderr (visible) and errors.log (persistent).
 */

import fs from 'fs/promises';
import path from 'path';
import { parseEpubFile } from '../epub/parser.js';
import { extractMetadata } from '../epub/metadata.js';
import { extractText, countWords } from '../epub/text.js';
import { createTokenizers, tokenizeText } from '../tokenizers/index.js';
import type { Tokenizer, TokenizerResult } from '../tokenizers/types.js';
import type { EpubResult } from '../output/table.js';

/**
 * Result from processing multiple EPUB files with error handling
 */
export interface ProcessingResult {
  /** Successfully processed EPUB files */
  successful: EpubResult[];
  /** Failed EPUB files with error details */
  failed: Array<{ file: string; error: string; suggestion?: string }>;
  /** Total number of files processed */
  total: number;
}

/**
 * Single error log entry for persistence
 */
export interface ErrorLogEntry {
  /** File path that failed */
  file: string;
  /** Error message */
  error: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Optional suggestion for fixing the error */
  suggestion?: string;
}

/**
 * Generate helpful error suggestion based on error code/message
 */
function generateSuggestion(error: Error, filePath: string): string | undefined {
  const errorCode = (error as any).code;
  const message = error.message.toLowerCase();

  // File not found
  if (errorCode === 'ENOENT') {
    return 'File not found. Check the file path.';
  }

  // Permission denied
  if (errorCode === 'EACCES') {
    return 'Check file permissions.';
  }

  // EPUB parsing errors
  if (message.includes('epub') || message.includes('parse') || message.includes('zip')) {
    return 'File may be corrupted or not a valid EPUB.';
  }

  // Generic suggestion
  return undefined;
}

/**
 * Log error to errors.log file in output directory
 *
 * Creates output directory if it doesn't exist.
 * Appends to errors.log file (creates if not exists).
 *
 * @param entry - Error log entry to write
 * @param outputDir - Output directory path (default: './results')
 */
export async function logError(entry: ErrorLogEntry, outputDir: string = './results'): Promise<void> {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Format error log entry
    const logLine = `[${entry.timestamp}] ${entry.file}: ${entry.error}${entry.suggestion ? ` Suggestion: ${entry.suggestion}` : ''}\n`;

    // Append to errors.log file
    const logPath = path.join(outputDir, 'errors.log');
    await fs.appendFile(logPath, logLine);
  } catch (error) {
    // If we can't write to error log, at least log to stderr
    console.error(`Failed to write to errors.log: ${error}`);
  }
}

/**
 * Process multiple EPUB files with continue-on-error behavior
 *
 * Processes all files even if some fail. Successful results are returned
 * in the successful array, failed files in the failed array with error details.
 * Errors are logged to stderr and to errors.log file.
 *
 * Tokenization is performed on extracted text using the specified tokenizers.
 * Token counts are accumulated per EPUB and returned in the tokenCounts map.
 *
 * @param filePaths - Array of EPUB file paths to process
 * @param verbose - Enable verbose logging (default: false)
 * @param outputDir - Output directory for errors.log (default: './results')
 * @param tokenizerNames - Array of tokenizer names to use (default: ['gpt4'])
 * @param maxMb - Maximum EPUB text size in MB (default: 500)
 * @returns Processing result with successful, failed arrays, total count, and tokenCounts
 *
 * @example
 * ```ts
 * const result = await processEpubsWithErrors(
 *   ['./books/good.epub', './books/bad.epub'],
 *   false,
 *   './results',
 *   ['gpt4', 'claude'],
 *   500
 * );
 * console.log(`Processed ${result.successful.length} of ${result.total} files`);
 * console.log(`Token counts:`, result.tokenCounts);
 * ```
 */
export async function processEpubsWithErrors(
  filePaths: string[],
  verbose: boolean = false,
  outputDir: string = './results',
  tokenizerNames: string[] = ['gpt4'],
  maxMb: number = 500
): Promise<ProcessingResult & { tokenCounts: Map<string, TokenizerResult[]> }> {
  const successful: EpubResult[] = [];
  const failed: Array<{ file: string; error: string; suggestion?: string }> = [];
  const tokenCounts = new Map<string, TokenizerResult[]>();

  // Create tokenizer instances
  let tokenizers: Tokenizer[] = [];
  try {
    tokenizers = createTokenizers(tokenizerNames);

    // Display Claude warning if needed
    if (tokenizerNames.includes('claude')) {
      console.warn('⚠️  Warning: Claude tokenizer is inaccurate for Claude 3+ models');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: Failed to create tokenizers: ${errorMessage}`);
    throw error;
  }

  for (const filePath of filePaths) {
    try {
      if (verbose) {
        console.log(`Processing: ${filePath}`);
      }

      // Parse EPUB file
      const parseResult = await parseEpubFile(filePath);

      // Extract metadata
      const metadata = extractMetadata(parseResult.info);

      // Get filename from path (needed for tokenCounts and error messages)
      const filename = path.basename(filePath);

      // Extract text and count words
      const text = extractText(parseResult.sections);
      const wordCount = countWords(text);

      // Check text size before processing (memory management)
      const maxBytes = maxMb * 1024 * 1024; // Convert MB to bytes
      if (text.length > maxBytes) {
        const sizeInMb = (text.length / 1024 / 1024).toFixed(2);
        throw new Error(
          `EPUB text size (${sizeInMb}MB) exceeds --max-mb limit (${maxMb}MB). ` +
          `Consider increasing --max-mb or processing the EPUB in smaller chunks.`
        );
      }

      // Tokenize with selected tokenizers
      let tokenResults: TokenizerResult[] = [];
      if (text.length > 0) {
        try {
          tokenResults = await tokenizeText(text, tokenizers);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Warning: Tokenization failed for ${filename}: ${errorMessage}`);
          // Add empty token results on failure
          tokenResults = tokenizers.map((t) => ({ name: t.name, count: -1 }));
        }
      }

      // Accumulate token counts by filename
      tokenCounts.set(filename, tokenResults);

      // Add to successful array
      successful.push({
        filename,
        file_path: path.resolve(filePath),
        wordCount,
        title: metadata.title,
        author: metadata.author,
        language: metadata.language,
        publisher: metadata.publisher,
      });

      if (verbose) {
        // Format token counts for verbose output
        const tokenStr = tokenResults.map((t) => `${t.name}=${t.count}`).join(', ');
        console.log(`  ✓ ${filename}: ${wordCount} words (${tokenStr})`);
      }
    } catch (error) {
      const errorObj = error as Error;
      const errorMessage = errorObj.message || 'Unknown error';
      const suggestion = generateSuggestion(errorObj, filePath);

      // Create error log entry
      const entry: ErrorLogEntry = {
        file: filePath,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        suggestion,
      };

      // Log to stderr (visible during processing)
      console.error(`Error: ${entry.file} - ${entry.error}`);

      // Log to errors.log file (persistent)
      await logError(entry, outputDir);

      // Add to failed array
      failed.push({
        file: filePath,
        error: errorMessage,
        suggestion,
      });

      if (verbose && suggestion) {
        console.error(`  Suggestion: ${suggestion}`);
      }
    }
  }

  return {
    successful,
    failed,
    total: filePaths.length,
    tokenCounts,
  };
}
