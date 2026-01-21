/**
 * Claude Tokenizer
 *
 * Tokenizer implementation for Claude using the @anthropic-ai/tokenizer library.
 * Provides token counts for Claude models (Claude 1, Claude 2).
 *
 * **Important Limitation:**
 * The official @anthropic-ai/tokenizer package is documented as inaccurate for
 * Claude 3+ models, which use a new tokenizer that is not publicly documented.
 * This implementation provides an approximation for Claude 3+ but counts are
 * not guaranteed to be accurate.
 *
 * **Implementation Notes:**
 * - Uses official @anthropic-ai/tokenizer package
 * - Simple countTokens(text) function call
 * - Synchronous token counting
 * - No initialization required (stateless)
 *
 * @module tokenizers/claude
 */

import { countTokens } from '@anthropic-ai/tokenizer';
import type { Tokenizer } from './types.js';

/**
 * Claude Tokenizer
 *
 * Tokenizer for Claude models using the official @anthropic-ai/tokenizer package.
 *
 * **WARNING - Claude 3+ Limitation:**
 * This tokenizer is only accurate for Claude 1 and Claude 2. Claude 3+ uses a
 * new tokenizer that is not publicly documented. This implementation provides
 * an approximation but counts are not guaranteed to be accurate for Claude 3+.
 *
 * For accurate Claude 3+ token counts, use the Anthropic API response usage field:
 * ```ts
 * const response = await anthropic.messages.create({...});
 * const actualTokens = response.usage.input_tokens;
 * ```
 *
 * @example
 * ```ts
 * const tokenizer = new ClaudeTokenizer();
 * const count = tokenizer.countTokens('Hello, world!');
 * console.log(`${count} tokens`); // Token count for Claude 1/2
 *
 * // For Claude 3+, use API response instead:
 * // const count = response.usage.input_tokens;
 * ```
 */
export class ClaudeTokenizer implements Tokenizer {
  /** Tokenizer name identifier */
  name = 'claude';

  /**
   * Create a new Claude tokenizer
   *
   * No initialization required - the tokenizer is stateless and uses
   * the underlying countTokens function directly.
   */
  constructor() {
    // Stateless - no initialization required
  }

  /**
   * Count tokens in text
   *
   * Tokenizes the input text using the official Anthropic tokenizer
   * and returns the number of tokens.
   *
   * **Accuracy Note:**
   * - Claude 1/2: Accurate token counts
   * - Claude 3+: Approximation only (use API usage field for accuracy)
   *
   * @param text - Text to tokenize
   * @returns Number of tokens in the text (approximate for Claude 3+)
   *
   * @example
   * ```ts
   * const tokenizer = new ClaudeTokenizer();
   * const count = tokenizer.countTokens('Hello, world!');
   * console.log(count); // Token count
   * ```
   */
  countTokens(text: string): number {
    // Direct call to official Anthropic tokenizer
    return countTokens(text);
  }
}
