/**
 * Error Handling Module
 *
 * Provides continue-on-error behavior for EPUB processing.
 * When one EPUB file fails to parse, processing continues for remaining files.
 * Errors are logged to both stderr (visible) and errors.log (persistent).
 */

import path from 'path';
import { parseEpubFile } from '../epub/parser.js';
import { extractMetadata } from '../epub/metadata.js';
import { extractText, countWords } from '../epub/text.js';
import { createTokenizers, tokenizeText } from '../tokenizers/index.js';
import { ErrorSeverity, logError, type ErrorLogEntry } from './logger.js';
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
 * Classify error severity and generate helpful suggestion based on error code/message
 *
 * Returns severity level (FATAL/ERROR/WARN) and optional suggestion.
 *
 * Classification rules:
 * - File not found (ENOENT): ERROR (file skipped)
 * - Permission denied (EACCES): ERROR (can't process this file)
 * - EPUB parsing errors: ERROR (file skipped, likely corrupted)
 * - Memory limit errors: FATAL (user must adjust settings)
 * - Unknown: ERROR (conservative default, skip file)
 *
 * @param error - Error object to classify
 * @param filePath - File path being processed (for context)
 * @returns Object with severity level and optional suggestion
 */
function classifyError(error: Error, filePath: string): { severity: ErrorSeverity; suggestion?: string } {
  const errorCode = (error as any).code;
  const message = error.message.toLowerCase();

  // File not found - usually ERROR (file skipped, not FATAL)
  if (errorCode === 'ENOENT') {
    return { severity: ErrorSeverity.ERROR, suggestion: 'File not found. Check the file path.' };
  }

  // Permission denied - ERROR (can't process this file)
  if (errorCode === 'EACCES') {
    return { severity: ErrorSeverity.ERROR, suggestion: 'Check file permissions.' };
  }

  // EPUB parsing errors - ERROR (file skipped)
  if (message.includes('epub') || message.includes('parse') || message.includes('zip')) {
    return { severity: ErrorSeverity.ERROR, suggestion: 'File may be corrupted or not a valid EPUB.' };
  }

  // Memory limit errors - FATAL (user must adjust)
  if (message.includes('exceeds --max-mb limit')) {
    return { severity: ErrorSeverity.FATAL, suggestion: 'Increase --max-mb or process in smaller chunks.' };
  }

  // Default: ERROR (unknown issue, skip file)
  return { severity: ErrorSeverity.ERROR };
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
      const { severity, suggestion } = classifyError(errorObj, filePath);

      // Create error log entry with severity
      const entry: ErrorLogEntry = {
        timestamp: new Date().toISOString(),
        severity,
        file: filePath,
        error: errorMessage,
        suggestion,
      };

      // Log using new logger module (handles console + file output)
      await logError(entry, outputDir);

      // Add to failed array
      failed.push({
        file: filePath,
        error: errorMessage,
        suggestion,
      });

      // FATAL errors stop processing
      if (severity === ErrorSeverity.FATAL) {
        throw errorObj; // Re-throw to stop processing
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
