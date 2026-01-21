/**
 * EPUB Parsing Wrapper
 *
 * Thin wrapper around @gxl/epub-parser to isolate the library API.
 * Provides a consistent interface for parsing EPUB files and extracting
 * their structure, sections, and metadata.
 */

import { parseEpub } from '@gxl/epub-parser';

/**
 * Result from parsing an EPUB file
 * Contains the sections (content) and info (metadata) from the EPUB
 */
export interface EpubParseResult {
  /** Array of sections from the EPUB, each containing HTML content and metadata */
  sections: any[] | undefined;
  /** Metadata object from the EPUB containing title, author, etc. */
  info: any;
}

/**
 * Parse an EPUB file and extract its sections and metadata
 *
 * @param filePath - Absolute path to the EPUB file to parse
 * @returns Promise resolving to EpubParseResult with sections and info
 * @throws Error with descriptive message including filePath if parsing fails
 *
 * @example
 * ```ts
 * try {
 *   const result = await parseEpubFile('/path/to/book.epub');
 *   console.log(`Parsed ${result.sections.length} sections`);
 *   console.log(`Title: ${result.info.title}`);
 * } catch (error) {
 *   console.error('Failed to parse EPUB:', error.message);
 * }
 * ```
 */
export async function parseEpubFile(filePath: string): Promise<EpubParseResult> {
  try {
    const epubObj = await parseEpub(filePath, { type: 'path' });

    return {
      sections: epubObj.sections,
      info: epubObj.info,
    };
  } catch (error) {
    // Re-throw with context for better error messages
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse EPUB file '${filePath}': ${message}`);
  }
}
