/**
 * EPUB Text Extraction and Word Counting
 *
 * Extracts readable text content from EPUB sections and counts words
 * accurately, excluding HTML tags and including CJK characters.
 *
 * Key features:
 * - Uses section.toMarkdown() to avoid HTML tag contamination
 * - Counts words using whitespace splitting with CJK character support
 * - Filters empty strings and non-word content
 */

/**
 * Extract text content from EPUB sections
 *
 * Iterates through all sections in the EPUB and extracts their text content
 * using the toMarkdown() method. This converts HTML content to markdown and
 * extracts the textContent, avoiding HTML tag contamination.
 *
 * @param sections - Array of sections from parsed EPUB (epubObj.sections)
 * @returns Concatenated text content from all sections separated by newlines
 *
 * @example
 * ```ts
 * const fullText = extractText(epubObj.sections);
 * console.log(`Extracted ${fullText.length} characters`);
 * ```
 */
export function extractText(sections: any[] | undefined): string {
  // Handle undefined or empty sections
  if (!sections || sections.length === 0) {
    return '';
  }

  const textParts: string[] = [];

  for (const section of sections) {
    // Use toMarkdown() to convert HTML to markdown
    // Note: @gxl/epub-parser's toMarkdown() returns a string directly, not an object
    if (typeof section.toMarkdown === 'function') {
      const markdown = section.toMarkdown();

      // toMarkdown() returns a string directly (markdown formatted text)
      if (markdown && typeof markdown === 'string') {
        textParts.push(markdown);
      }
    }
  }

  // Concatenate all section text with newlines
  return textParts.join('\n');
}

/**
 * Count words in text
 *
 * Counts words by splitting on whitespace and filtering for actual words.
 * Supports CJK characters (Chinese, Japanese, Korean) in addition to Latin
 * scripts and numbers.
 *
 * Process:
 * 1. Remove HTML tags using regex (defense in case HTML is present)
 * 2. Split by whitespace
 * 3. Filter empty strings
 * 4. Filter for actual words (alphanumeric + CJK characters)
 *
 * @param text - Text string to count words in
 * @returns Number of words found in the text
 *
 * @example
 * ```ts
 * const wordCount = countWords('Hello world 你好世界');
 * console.log(`Word count: ${wordCount}`); // Output: Word count: 4
 * ```
 */
export function countWords(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  // Step 1: Remove HTML tags (defense in case HTML is present)
  // This replaces tags with spaces to prevent word concatenation
  const plainText = text.replace(/<[^>]*>/g, ' ');

  // Step 2: Split by whitespace
  const words = plainText.split(/\s+/);

  // Step 3 & 4: Filter empty strings and count actual words
  // A word contains at least one alphanumeric or CJK character
  let count = 0;
  for (const word of words) {
    if (word.length === 0) continue;

    // Check if word contains at least one valid character
    // Matches: a-z, A-Z, 0-9, CJK characters (U+4E00 to U+9FFF)
    if (/[a-zA-Z0-9\u4e00-\u9fff]/.test(word)) {
      count++;
    }
  }

  return count;
}
