/**
 * Markdown Output Module
 *
 * Generates markdown report with summary statistics, successful EPUBs table,
 * and failed EPUBs list with error details.
 */

import fs from 'fs/promises';
import path from 'path';
import type { ProcessingResult } from '../errors/handler.js';

/**
 * Markdown output generation options
 */
export interface MarkdownOptions {
  /** Output directory path (default: './results' per CFG-02, accepts custom path for CLI-05) */
  outputDir: string;
  /** Output filename (default: 'results.md') */
  filename: string;
}

/**
 * Generate markdown content from processing result
 *
 * Creates formatted markdown with:
 * - Header with title
 * - Timestamp
 * - Summary section with statistics
 * - Successful EPUBs table (if any)
 * - Failed EPUBs list with errors (if any)
 *
 * @param result - Processing result from processEpubsWithErrors
 * @param timestamp - ISO 8601 timestamp
 * @returns Formatted markdown string
 */
export function generateResultsMarkdown(result: ProcessingResult, timestamp: string): string {
  const lines: string[] = [];

  // Header
  lines.push('# EPUB Processing Results');
  lines.push('');
  lines.push(`Generated: ${timestamp}`);
  lines.push('');

  // Summary section
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total: ${result.total}`);
  lines.push(`- Successful: ${result.successful.length}`);
  lines.push(`- Failed: ${result.failed.length}`);
  lines.push('');

  // Successful EPUBs table
  if (result.successful.length > 0) {
    lines.push('## Successful EPUBs');
    lines.push('');
    lines.push('| Filename | Words | Title | Author |');
    lines.push('|----------|-------|-------|--------|');

    for (const epub of result.successful) {
      const filename = epub.filename.replace(/\|/g, '\\|');
      const title = epub.title.replace(/\|/g, '\\|');
      const author = epub.author.replace(/\|/g, '\\|');
      lines.push(`| ${filename} | ${epub.wordCount} | ${title} | ${author} |`);
    }

    lines.push('');
  }

  // Failed EPUBs list
  if (result.failed.length > 0) {
    lines.push('## Failed EPUBs');
    lines.push('');

    for (const failure of result.failed) {
      lines.push(`### ${path.basename(failure.file)}`);
      lines.push('');
      lines.push(`**File:** \`${failure.file}\``);
      lines.push('');
      lines.push(`**Error:** ${failure.error}`);
      if (failure.suggestion) {
        lines.push('');
        lines.push(`**Suggestion:** ${failure.suggestion}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Write markdown results file to output directory
 *
 * Creates output directory if it doesn't exist.
 * Generates markdown content and writes to file.
 *
 * @param result - Processing result from processEpubsWithErrors
 * @param options - Output options (default: { outputDir: './results', filename: 'results.md' })
 * @returns Absolute path to written file
 *
 * @example
 * ```ts
 * const mdPath = await writeResultsFile(result, {
 *   outputDir: './results',
 *   filename: 'results.md'
 * });
 * console.log(`Markdown written to: ${mdPath}`);
 * ```
 */
export async function writeResultsFile(
  result: ProcessingResult,
  options: Partial<MarkdownOptions> = {}
): Promise<string> {
  // Default options
  const opts: MarkdownOptions = {
    outputDir: options.outputDir || './results',
    filename: options.filename || 'results.md',
  };

  // Ensure output directory exists
  await fs.mkdir(opts.outputDir, { recursive: true });

  // Generate markdown content
  const content = generateResultsMarkdown(result, new Date().toISOString());

  // Write to file
  const filePath = path.join(opts.outputDir, opts.filename);
  await fs.writeFile(filePath, content);

  // Return absolute path
  return path.resolve(filePath);
}
