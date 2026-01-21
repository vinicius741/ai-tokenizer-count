/**
 * Tokenization Orchestration Module
 *
 * Coordinates tokenization across multiple tokenizer implementations.
 * Provides factory function for creating tokenizers from names and
 * orchestrates batch tokenization with error handling.
 *
 * **Supported Tokenizer Formats:**
 * - Presets: "gpt4", "claude"
 * - Hugging Face: "hf:model-name" (e.g., "hf:bert-base-uncased")
 *
 * **Error Handling:**
 * - Individual tokenizer failures don't stop processing
 * - Failed tokenizers return count: -1 to distinguish from 0 tokens
 * - Errors are logged to stderr for visibility
 *
 * @module tokenizers/index
 */

import { GPT4Tokenizer } from './gpt.js';
import { ClaudeTokenizer } from './claude.js';
import { HFTokenizer } from './huggingface.js';
import type { Tokenizer, TokenizerResult } from './types.js';

/**
 * Create tokenizer instances from names
 *
 * Factory function that parses tokenizer names and creates corresponding
 * tokenizer instances. Supports both preset names and Hugging Face models.
 *
 * **Supported Formats:**
 * - `gpt4`: GPT-4 tokenizer (cl100k_base encoding)
 * - `claude`: Claude tokenizer (@anthropic-ai/tokenizer)
 * - `hf:model-name`: Hugging Face model (e.g., `hf:bert-base-uncased`, `hf:gpt2`)
 *
 * @param names - Array of tokenizer names to create
 * @returns Array of tokenizer instances
 * @throws Error if tokenizer name is invalid
 *
 * @example
 * ```ts
 * // Create preset tokenizers
 * const tokenizers = createTokenizers(['gpt4', 'claude']);
 *
 * // Create Hugging Face tokenizers
 * const hfTokenizers = createTokenizers(['hf:bert-base-uncased', 'hf:gpt2']);
 *
 * // Mix presets and Hugging Face
 * const mixed = createTokenizers(['gpt4', 'hf:bert-base-uncased']);
 * ```
 */
export function createTokenizers(names: string[]): Tokenizer[] {
  const tokenizers: Tokenizer[] = [];

  for (const name of names) {
    if (name === 'gpt4') {
      tokenizers.push(new GPT4Tokenizer());
    } else if (name === 'claude') {
      tokenizers.push(new ClaudeTokenizer());
    } else if (name.startsWith('hf:')) {
      // Extract model name from "hf:model-name"
      const modelName = name.replace(/^hf:/, '');
      tokenizers.push(new HFTokenizer(modelName));
    } else {
      // Unknown tokenizer - throw error
      throw new Error(
        `Unknown tokenizer: ${name}. Valid presets: gpt4, claude. Or use hf:model-name for Hugging Face models.`
      );
    }
  }

  return tokenizers;
}

/**
 * Tokenize text with multiple tokenizers
 *
 * Orchestrates tokenization across multiple tokenizer implementations.
 * Handles both synchronous (GPT-4, Claude) and asynchronous (Hugging Face)
 * tokenizers seamlessly using Promise.resolve().
 *
 * **Error Resilience:**
 * - If a tokenizer fails, it returns count: -1 (distinguishable from 0 tokens)
 * - Error is logged to stderr but processing continues for other tokenizers
 * - This ensures partial results are available even if one tokenizer fails
 *
 * @param text - Text to tokenize
 * @param tokenizers - Array of tokenizer instances to use
 * @returns Promise resolving to array of tokenizer results
 *
 * @example
 * ```ts
 * const tokenizers = createTokenizers(['gpt4', 'claude']);
 * const results = await tokenizeText('Hello, world!', tokenizers);
 * // Result: [{ name: 'gpt4', count: 3 }, { name: 'claude', count: 3 }]
 *
 * // Handle failed tokenizer
 * const results = await tokenizeText('test', [badTokenizer]);
 * // Result: [{ name: 'bad', count: -1 }]  // -1 indicates error
 * ```
 */
export async function tokenizeText(
  text: string,
  tokenizers: Tokenizer[]
): Promise<TokenizerResult[]> {
  const results: TokenizerResult[] = [];

  for (const tokenizer of tokenizers) {
    try {
      // Handle both sync and async countTokens
      // Promise.resolve() wraps sync results in a Promise
      const count = await Promise.resolve(tokenizer.countTokens(text));
      results.push({ name: tokenizer.name, count });
    } catch (error) {
      // Log error but continue with other tokenizers
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Warning: Tokenizer '${tokenizer.name}' failed: ${errorMessage}`);
      results.push({ name: tokenizer.name, count: -1 }); // -1 indicates error
    }
  }

  return results;
}
