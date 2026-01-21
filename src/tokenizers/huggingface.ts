/**
 * Hugging Face Tokenizer
 *
 * Tokenizer implementation for Hugging Face models using @huggingface/transformers.
 * Supports any model available on the Hugging Face Hub.
 *
 * **Implementation Notes:**
 * - Uses AutoTokenizer.from_pretrained() to download tokenizer from HF Hub
 * - Lazy initialization: tokenizer downloaded on first use
 * - Async tokenization (model loading requires network I/O)
 * - Model name is dynamic (passed to constructor)
 * - Supports any HF Hub model (bert-base-uncased, gpt2, etc.)
 *
 * @module tokenizers/huggingface
 */

import { AutoTokenizer } from '@huggingface/transformers';
import type { Tokenizer } from './types.js';

/**
 * Hugging Face Tokenizer
 *
 * Tokenizer for Hugging Face models using the @huggingface/transformers library.
 * Supports any model available on the Hugging Face Hub.
 *
 * **Usage:**
 * Pass the model name to the constructor. The tokenizer will be downloaded
 * from the Hugging Face Hub on first use (lazy initialization).
 *
 * @example
 * ```ts
 * // BERT tokenizer
 * const bert = new HFTokenizer('bert-base-uncased');
 * const count = await bert.countTokens('Hello, world!');
 * console.log(`${count} tokens`); // 3 tokens
 *
 * // GPT-2 tokenizer
 * const gpt2 = new HFTokenizer('gpt2');
 * const count = await gpt2.countTokens('Hello, world!');
 *
 * // Any HF Hub model
 * const llama = new HFTokenizer('meta-llama/Llama-2-7b');
 * ```
 */
export class HFTokenizer implements Tokenizer {
  /** Tokenizer name (Hugging Face model identifier) */
  name: string;

  /** Underlying tokenizer instance (lazy-loaded) */
  private tokenizer: any = null;

  /** Track if tokenizer has been initialized */
  private initialized = false;

  /**
   * Create a new Hugging Face tokenizer
   *
   * The tokenizer is not initialized in the constructor (lazy initialization).
   * It will be downloaded from the Hugging Face Hub on the first call to countTokens().
   *
   * @param modelName - Hugging Face model name (e.g., 'bert-base-uncased', 'gpt2')
   *
   * @example
   * ```ts
   * const tokenizer = new HFTokenizer('bert-base-uncased');
   * // Not downloaded yet - will be downloaded on first countTokens() call
   * ```
   */
  constructor(modelName: string) {
    this.name = modelName;
  }

  /**
   * Initialize the tokenizer
   *
   * Downloads the tokenizer from the Hugging Face Hub if not already loaded.
   * Uses AutoTokenizer.from_pretrained() to automatically detect the correct
   * tokenizer class for the model.
   *
   * @throws Error if model name is invalid or model cannot be downloaded
   *
   * @private
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Download tokenizer from Hugging Face Hub
      // AutoTokenizer.from_pretrained() automatically detects the correct tokenizer
      this.tokenizer = await AutoTokenizer.from_pretrained(this.name);
      this.initialized = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to load tokenizer for model "${this.name}". ` +
        `Error: ${errorMessage}\n\n` +
        `Please check that:\n` +
        `1. The model name is correct\n` +
        `2. The model exists on the Hugging Face Hub: https://huggingface.co/models\n` +
        `3. You have an internet connection (first download requires network)`
      );
    }
  }

  /**
   * Count tokens in text
   *
   * Tokenizes the input text using the Hugging Face model's tokenizer
   * and returns the number of tokens.
   *
   * **Async method** - Hugging Face tokenizer loading and tokenization
   * are asynchronous operations.
   *
   * @param text - Text to tokenize
   * @returns Promise resolving to number of tokens in the text
   *
   * @throws Error if model cannot be loaded (see initialize() error messages)
   *
   * @example
   * ```ts
   * const tokenizer = new HFTokenizer('bert-base-uncased');
   * const count = await tokenizer.countTokens('Hello, world!');
   * console.log(count); // 3
   * ```
   */
  async countTokens(text: string): Promise<number> {
    await this.initialize();

    // Tokenize text and get token IDs
    // The encode() method returns an object with input_ids property
    const { input_ids } = await this.tokenizer.encode(text);
    return input_ids.length;
  }
}
