/**
 * Tokenizer Types and Factory
 *
 * Abstraction layer for multi-model tokenization. Provides a unified interface
 * for counting tokens across different tokenizer implementations (GPT-4, Claude,
 * Hugging Face models).
 *
 * Per CONTEXT.md decision: Uses short preset names (gpt4, claude) not
 * cl100k_base for better user experience.
 */

/**
 * Tokenizer interface
 *
 * Abstraction for all tokenizer implementations. Each tokenizer provides
 * a name and a method to count tokens in text.
 *
 * @example
 * ```ts
 * const tokenizer = createTokenizer('gpt4');
 * const count = tokenizer.countTokens('Hello, world!');
 * console.log(`${count} tokens`);
 * ```
 */
export interface Tokenizer {
  /**
   * Tokenizer name (e.g., "gpt4", "claude", "bert-base-uncased")
   */
  name: string;

  /**
   * Count tokens in the given text
   *
   * @param text - Text to tokenize
   * @returns Number of tokens, or Promise resolving to token count for async tokenizers
   *
   * @example
   * ```ts
   * // Synchronous tokenizer (GPT-4, Claude)
   * const count = tokenizer.countTokens('hello');
   *
   * // Asynchronous tokenizer (Hugging Face)
   * const count = await tokenizer.countTokens('hello');
   * ```
   */
  countTokens(text: string): number | Promise<number>;
}

/**
 * Tokenizer result
 *
 * Return type for tokenization operations. Contains the tokenizer name
 * and the token count for a given text.
 *
 * @example
 * ```ts
 * const result: TokenizerResult = {
 *   name: 'gpt4',
 *   count: 1234
 * };
 * ```
 */
export interface TokenizerResult {
  /**
   * Tokenizer name that produced this result
   */
  name: string;

  /**
   * Number of tokens counted
   */
  count: number;
}

/**
 * Create a tokenizer by name
 *
 * Factory function to create tokenizer instances. Supports preset names
 * for common models and arbitrary Hugging Face model names.
 *
 * **Presets:**
 * - `gpt4`: GPT-4 tokenizer using cl100k_base encoding
 * - `claude`: Claude tokenizer using @anthropic-ai/tokenizer
 *
 * **Hugging Face models:**
 * Any other string is treated as a Hugging Face model name (e.g., "bert-base-uncased")
 *
 * @param name - Tokenizer name (preset or Hugging Face model)
 * @returns Tokenizer instance
 * @throws Error if tokenizer name is invalid or tokenizer cannot be created
 *
 * @example
 * ```ts
 * // Preset tokenizers
 * const gpt4 = createTokenizer('gpt4');
 * const claude = createTokenizer('claude');
 *
 * // Hugging Face models
 * const bert = createTokenizer('bert-base-uncased');
 * const gpt2 = createTokenizer('gpt2');
 *
 * // Count tokens
 * const count = gpt4.countTokens('Hello, world!');
 * ```
 */
export function createTokenizer(name: string): Tokenizer {
  // TODO: Implement tokenizer creation logic
  // This will be implemented in subsequent plans:
  // - 02-02: GPT-4 tokenizer using js-tiktoken
  // - 02-03: Claude tokenizer using @anthropic-ai/tokenizer
  // - 02-04: Hugging Face tokenizer using @huggingface/transformers

  throw new Error(`Tokenizer creation not yet implemented. Will be implemented in plans 02-02 through 02-04. Requested: "${name}"`);
}
