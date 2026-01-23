/**
 * Path Validation Utilities
 *
 * Provides security-focused path validation to prevent path traversal attacks
 * and ensure paths exist and are accessible.
 *
 * @module lib/path-validator
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Detect path traversal attempts
 *
 * Checks for common path traversal patterns:
 * - .. (parent directory)
 * - Absolute paths starting with /
 * - ~ (home directory expansion)
 *
 * @param inputPath - Path to check
 * @returns true if path traversal detected
 *
 * @example
 * ```ts
 * isPathTraversal('../../etc/passwd')  // true
 * isPathTraversal('/etc/passwd')        // true
 * isPathTraversal('~/secret.txt')       // true
 * isPathTraversal('./epubs')            // false
 * ```
 */
export function isPathTraversal(inputPath: string): boolean {
  const normalized = inputPath.replace(/\\/g, '/');
  return normalized.includes('..') ||
         normalized.startsWith('/') ||
         normalized.includes('~');
}

/**
 * Path validation result
 */
export interface PathValidationResult {
  /** Whether the path is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Resolved absolute path if valid */
  resolvedPath?: string;
}

/**
 * Validate and resolve a path
 *
 * Performs security checks and filesystem validation:
 * 1. Checks for path traversal attempts
 * 2. Resolves relative to current working directory
 * 3. Verifies path exists
 * 4. Confirms it's a file or directory
 *
 * @param inputPath - Path to validate
 * @returns Validation result with resolved path or error
 *
 * @example
 * ```ts
 * const result = await validatePath('./epubs');
 * if (result.valid) {
 *   console.log('Resolved path:', result.resolvedPath);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */
export async function validatePath(inputPath: string): Promise<PathValidationResult> {
  // Check for path traversal
  if (isPathTraversal(inputPath)) {
    return {
      valid: false,
      error: 'Path traversal detected'
    };
  }

  // Resolve relative to current working directory
  const resolved = path.resolve(process.cwd(), inputPath);

  // Check if path exists
  try {
    const stats = await fs.stat(resolved);
    if (!stats.isDirectory() && !stats.isFile()) {
      return {
        valid: false,
        error: 'Path must be a file or directory'
      };
    }
    return {
      valid: true,
      resolvedPath: resolved
    };
  } catch {
    return {
      valid: false,
      error: 'Path does not exist'
    };
  }
}
