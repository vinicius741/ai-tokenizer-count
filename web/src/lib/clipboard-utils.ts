/**
 * Clipboard Utilities
 *
 * Utility functions for copying data to clipboard with fallback support.
 * Uses Clipboard API with document.execCommand fallback for broader browser support.
 */

import type { EpubResult } from '@epub-counter/shared';

/**
 * Copy data interface for clipboard formatting
 */
export interface CopyData {
  /** EPUB title */
  title: string;
  /** EPUB author */
  author: string;
  /** Word count */
  wordCount: number;
  /** Token count */
  tokenCount: number;
}

/**
 * Format books for clipboard output
 *
 * Creates a formatted text representation of selected books
 * with title, author, word count, and token count.
 *
 * @param books - Array of EPUB results
 * @param tokenizer - Tokenizer name to get token counts from
 * @returns Formatted string for clipboard
 */
export function formatBooksForClipboard(
  books: EpubResult[],
  tokenizer: string
): string {
  if (books.length === 0) {
    return 'No books selected.';
  }

  const lines: string[] = [];

  // Header
  lines.push('Selected EPUBs for Token Budget:');
  lines.push('');

  // Book entries
  books.forEach((book, index) => {
    const tokenCount = book.tokenCounts.find(t => t.name === tokenizer)?.count ?? 0;
    lines.push(
      `${index + 1}. ${book.metadata.title} by ${book.metadata.author}`
    );
    lines.push(`   Words: ${book.wordCount.toLocaleString()} · Tokens: ${tokenCount.toLocaleString()}`);
  });

  // Summary
  const totalWords = books.reduce((sum, book) => sum + book.wordCount, 0);
  const totalTokens = books.reduce((sum, book) => {
    const tokenCount = book.tokenCounts.find(t => t.name === tokenizer)?.count ?? 0;
    return sum + tokenCount;
  }, 0);

  lines.push('');
  lines.push(`Total: ${books.length} books`);
  lines.push(`Total Words: ${totalWords.toLocaleString()}`);
  lines.push(`Total Tokens: ${totalTokens.toLocaleString()}`);

  return lines.join('\n');
}

/**
 * Copy text to clipboard
 *
 * Attempts to use the modern Clipboard API first, with a fallback
 * to document.execCommand for broader browser support.
 *
 * @param text - Text to copy
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first (requires secure context)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
      // Fall through to fallback method
    }
  }

  // Fallback: document.execCommand with textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    return successful;
  } catch (error) {
    console.error('Fallback copy failed:', error);
    return false;
  }
}

/**
 * React hook for copying to clipboard with toast notifications
 *
 * @param tokenizer - Tokenizer name to get token counts from
 * @returns Object with copy function
 */
export function useCopyToClipboard(tokenizer: string) {
  const copy = async (books: EpubResult[]): Promise<boolean> => {
    const text = formatBooksForClipboard(books, tokenizer);
    const success = await copyToClipboard(text);

    if (success) {
      // Success notification handled by caller via toast
      return true;
    } else {
      // Error notification handled by caller via toast
      return false;
    }
  };

  return { copy };
}
