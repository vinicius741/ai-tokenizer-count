/**
 * JSON Download Utilities
 *
 * Utility functions for downloading data as JSON files using Blob API.
 * Enables client-side file generation without server interaction.
 */

import type { EpubResult } from '@epub-counter/shared';

/**
 * Summary statistics for export
 */
export interface ExportSummary {
  /** Number of selected books */
  count: number;
  /** Total words */
  totalWords: number;
  /** Total tokens */
  totalTokens: number;
}

/**
 * Export data structure for JSON download
 */
export interface ExportData {
  /** Export timestamp */
  exportedAt: string;
  /** Token budget used */
  budget: number;
  /** Tokenizer used */
  tokenizer: string;
  /** Optimization strategy */
  strategy: string;
  /** Selected EPUB books */
  selectedBooks: Array<{
    title: string;
    author: string;
    wordCount: number;
    tokenCount: number;
  }>;
  /** Summary statistics */
  summary: ExportSummary;
}

/**
 * Format export data from selected books
 *
 * Creates a structured export object with metadata and book details.
 *
 * @param books - Array of selected EPUB results
 * @param budget - Token budget used
 * @param tokenizer - Tokenizer name
 * @param strategy - Optimization strategy
 * @returns Formatted export data
 */
export function formatExportData(
  books: EpubResult[],
  budget: number,
  tokenizer: string,
  strategy: string
): ExportData {
  // Calculate summary statistics
  const totalWords = books.reduce((sum, book) => sum + book.wordCount, 0);
  const totalTokens = books.reduce((sum, book) => {
    const tokenCount = book.tokenCounts.find(t => t.name === tokenizer)?.count ?? 0;
    return sum + tokenCount;
  }, 0);

  // Transform books to export format
  const selectedBooks = books.map((book) => {
    const tokenCount = book.tokenCounts.find(t => t.name === tokenizer)?.count ?? 0;
    return {
      title: book.metadata.title,
      author: book.metadata.author,
      wordCount: book.wordCount,
      tokenCount,
    };
  });

  return {
    exportedAt: new Date().toISOString(),
    budget,
    tokenizer,
    strategy,
    selectedBooks,
    summary: {
      count: books.length,
      totalWords,
      totalTokens,
    },
  };
}

/**
 * Download data as JSON file
 *
 * Creates a Blob with JSON data and triggers a browser download.
 * Properly cleans up the object URL to prevent memory leaks.
 *
 * @param data - Data to download
 * @param filename - Name for the downloaded file
 */
export function downloadJson(data: ExportData, filename: string): void {
  try {
    // Create Blob with JSON data
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create object URL
    const url = URL.createObjectURL(blob);

    // Create anchor element and trigger download
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup - remove element and revoke object URL
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * React hook for JSON download
 *
 * @returns Object with download function
 */
export function useJsonDownload() {
  const download = (
    books: EpubResult[],
    budget: number,
    tokenizer: string,
    strategy: string
  ): void => {
    const data = formatExportData(books, budget, tokenizer, strategy);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `budget-selection-${timestamp}.json`;

    downloadJson(data, filename);
  };

  return { download };
}
