/**
 * EPUB Metadata Extraction
 *
 * Extracts Dublin Core metadata elements from EPUB files.
 * Handles EPUB 2.0.1 and EPUB 3.x metadata formats.
 *
 * Dublin Core elements:
 * - title: The title of the EPUB
 * - creator: The author/creator of the EPUB
 * - language: The language code (e.g., 'en', 'zh')
 * - publisher: The publisher of the EPUB
 */

/**
 * Metadata extracted from an EPUB file
 * Based on Dublin Core metadata elements (EPUB 3.3 specification)
 */
export interface EpubMetadata {
  /** Title of the EPUB (required) */
  title: string;
  /** Author/creator of the EPUB (required) */
  author: string;
  /** Language code (optional, e.g., 'en', 'zh', 'es') */
  language?: string;
  /** Publisher name (optional) */
  publisher?: string;
}

/**
 * Extract metadata from EPUB info object
 *
 * Extracts Dublin Core metadata elements from the EPUB's info object.
 * Provides default values for required fields (title, author) when missing.
 * Optional fields (language, publisher) are undefined if not present.
 *
 * @param epubInfo - The info object from parsed EPUB (epubObj.info)
 * @returns EpubMetadata object with extracted metadata
 *
 * @example
 * ```ts
 * const metadata = extractMetadata(epubObj.info);
 * console.log(`Title: ${metadata.title}`);
 * console.log(`Author: ${metadata.author}`);
 * if (metadata.language) {
 *   console.log(`Language: ${metadata.language}`);
 * }
 * ```
 */
export function extractMetadata(epubInfo: any): EpubMetadata {
  // Handle missing or undefined epubInfo gracefully
  // Note: @gxl/epub-parser returns { sections, info } where info is the metadata object
  if (!epubInfo) {
    return {
      title: 'Unknown Title',
      author: 'Unknown Author',
    };
  }

  // epubInfo is the metadata object directly (contains title, author, language, publisher)
  return {
    // Required fields with defaults
    title: epubInfo.title || 'Unknown Title',
    author: epubInfo.author || epubInfo.creator || 'Unknown Author',

    // Optional fields (undefined if missing)
    language: epubInfo.language,
    publisher: epubInfo.publisher,
  };
}
