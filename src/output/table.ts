/**
 * Table Output Formatting
 *
 * Displays EPUB analysis results in a formatted table using cli-table3.
 * Provides clean, readable output with proper column alignment and word wrapping.
 */

import Table from 'cli-table3';

/**
 * Result from processing a single EPUB file
 */
export interface EpubResult {
  /** Filename of the EPUB file */
  filename: string;
  /** Absolute file path (optional, for JSON output) */
  file_path?: string;
  /** Total word count in the EPUB */
  wordCount: number;
  /** Title of the EPUB */
  title: string;
  /** Author of the EPUB */
  author: string;
  /** Language code (optional, for JSON output) */
  language?: string;
  /** Publisher name (optional, for JSON output) */
  publisher?: string;
}

/**
 * Options for table display
 */
export interface TableOptions {
  /** Enable verbose output (for future extensibility) */
  verbose?: boolean;
}

/**
 * Display EPUB results in a formatted table
 *
 * Creates a table with 4 columns: Filename, Words, Title, Author.
 * Handles long content with word wrapping and proper column widths.
 *
 * @param results - Array of EPUB results to display
 * @param options - Optional display options
 *
 * @example
 * ```ts
 * const results: EpubResult[] = [
 *   { filename: 'book.epub', wordCount: 50000, title: 'My Book', author: 'Jane Doe' }
 * ];
 * displayResults(results);
 * ```
 */
export function displayResults(results: EpubResult[], options?: TableOptions): void {
  // Handle empty results
  if (!results || results.length === 0) {
    console.log('No EPUB files found.');
    return;
  }

  // Create table with configuration
  const table = new Table({
    head: ['Filename', 'Words', 'Title', 'Author'],
    colWidths: [30, 10, 40, 25],
    wordWrap: true,
    style: {
      head: ['cyan', 'bold'],
      border: ['grey'],
    },
  });

  // Add each result as a row
  for (const result of results) {
    table.push([
      result.filename,
      result.wordCount.toString(),
      result.title,
      result.author,
    ]);
  }

  // Display the table
  console.log(table.toString());
}
