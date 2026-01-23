/**
 * Shared Types for EPUB Tokenizer Counter
 *
 * This module contains all shared TypeScript interfaces and types used
 * across the CLI, web UI, and backend API. By centralizing these types,
 * we ensure consistency and eliminate code duplication.
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
 * Tokenizer interface
 *
 * Abstraction for all tokenizer implementations. Each tokenizer provides
 * a name and a method to count tokens in text.
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
   */
  countTokens(text: string): number | Promise<number>;
}

/**
 * Tokenizer result
 *
 * Return type for tokenization operations. Contains the tokenizer name
 * and the token count for a given text.
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
 * Supported tokenizer types
 */
export type TokenizerType = 'gpt4' | 'claude' | `hf:${string}`;

/**
 * Tokenizer information for display/configuration
 */
export interface TokenizerInfo {
  /** Unique identifier (e.g., "gpt4", "claude", "hf:bert-base-uncased") */
  id: TokenizerType;
  /** Display name (e.g., "GPT-4", "Claude", "BERT Base Uncased") */
  name: string;
  /** Description of the tokenizer/model */
  description?: string;
  /** Whether this tokenizer runs asynchronously (Hugging Face models) */
  async: boolean;
}

/**
 * Processing options for EPUB tokenization
 */
export interface ProcessOptions {
  /** Tokenizers to use (default: ['gpt4']) */
  tokenizers?: TokenizerType[];
  /** Maximum EPUB text size in MB (default: 500) */
  maxMb?: number;
  /** Number of parallel jobs (default: CPU count - 1) */
  jobs?: number;
  /** Continue processing even if some EPUBs fail (default: true) */
  continueOnError?: boolean;
}

/**
 * Single EPUB processing result
 */
export interface EpubResult {
  /** File path of the EPUB */
  filePath: string;
  /** Extracted metadata */
  metadata: EpubMetadata;
  /** Word count */
  wordCount: number;
  /** Token counts by tokenizer */
  tokenCounts: TokenizerResult[];
  /** Processing error (if any) */
  error?: string;
}

/**
 * Complete output from processing EPUBs
 */
export interface ResultsOutput {
  /** Schema version for compatibility tracking */
  schemaVersion: string;
  /** Processing timestamp */
  timestamp: string;
  /** Processing options used */
  options: ProcessOptions;
  /** Results for each EPUB */
  results: EpubResult[];
  /** Summary statistics */
  summary: {
    /** Total EPUBs processed */
    total: number;
    /** Successful processing */
    success: number;
    /** Failed processing */
    failed: number;
  };
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message (if success is false) */
  error?: string;
}

/**
 * Health check response
 */
export interface HealthResponse {
  /** API health status */
  status: 'healthy' | 'unhealthy';
  /** Current version */
  version: string;
  /** Uptime in seconds */
  uptime: number;
}
