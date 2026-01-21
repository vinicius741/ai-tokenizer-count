/**
 * GPT-4 Tokenizer
 *
 * Tokenizer implementation for GPT-4 using the js-tiktoken library.
 * Uses the cl100k_base encoding (used by GPT-4, GPT-3.5-turbo, and text-embedding-ada-002).
 *
 * **Implementation Notes:**
 * - Uses encoding_for_model('gpt-4') for future-proofing
 * - Lazy initialization: encoder is created on first use
 * - Must call dispose() to free WASM memory when done
 * - Synchronous token counting
 *
 * @module tokenizers/gpt
 */

import { encodingForModel, Tiktoken } from 'js-tiktoken';
import type { Tokenizer } from './types.js';

/**
 * GPT-4 Tokenizer
 *
 * Tokenizer for GPT-4 using the cl100k_base encoding via js-tiktoken.
 * Provides accurate token counts for GPT-4, GPT-3.5-turbo, and compatible models.
 *
 * @example
 * ```ts
 * const tokenizer = new GPT4Tokenizer();
 * const count = tokenizer.countTokens('Hello, world!');
 * console.log(`${count} tokens`); // 3 tokens
 *
 * // Clean up when done
 * tokenizer.dispose();
 * ```
 */
export class GPT4Tokenizer implements Tokenizer {
  /** Tokenizer name identifier */
  name = 'gpt4';

  /** Underlying tiktoken encoder (lazy-loaded) */
  private encoder: Tiktoken | null = null;

  /**
   * Create a new GPT-4 tokenizer
   *
   * The encoder is not initialized in the constructor (lazy initialization).
   * It will be created on the first call to countTokens().
   */
  constructor() {
    // Lazy initialization - encoder will be created on first use
  }

  /**
   * Get or create the tiktoken encoder
   *
   * Lazy-loads the encoder on first access. Uses encodingForModel('gpt-4')
   * rather than directly loading cl100k_base for future-proofing.
   *
   * @returns The tiktoken encoder instance
   */
  private getEncoder(): Tiktoken {
    if (!this.encoder) {
      // Use encodingForModel('gpt-4') for future-proofing
      // This ensures we get the correct encoding even if GPT-4 changes to a new encoding
      this.encoder = encodingForModel('gpt-4');
    }
    return this.encoder;
  }

  /**
   * Count tokens in text
   *
   * Tokenizes the input text using GPT-4's cl100k_base encoding and
   * returns the number of tokens.
   *
   * @param text - Text to tokenize
   * @returns Number of tokens in the text
   *
   * @example
   * ```ts
   * const tokenizer = new GPT4Tokenizer();
   * const count = tokenizer.countTokens('Hello, world!');
   * console.log(count); // 3
   * ```
   */
  countTokens(text: string): number {
    const enc = this.getEncoder();
    const tokens = enc.encode(text);
    return tokens.length;
  }

  /**
   * Free resources
   *
   * Releases the underlying tiktoken encoder reference.
   * Should be called when the tokenizer is no longer needed.
   *
   * After calling dispose(), the tokenizer can still be used - a new encoder
   * will be created on the next call to countTokens().
   *
   * Note: js-tiktoken manages WASM memory automatically via garbage collection.
   * This method simply clears the reference to allow GC.
   *
   * @example
   * ```ts
   * const tokenizer = new GPT4Tokenizer();
   * tokenizer.countTokens('test');
   * tokenizer.dispose(); // Clear reference
   * ```
   */
  dispose(): void {
    this.encoder = null;
  }
}
