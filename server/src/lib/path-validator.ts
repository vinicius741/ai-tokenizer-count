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
 * - .. (parent directory traversal)
 * - ~ (home directory expansion which can lead outside project)
 *
 * Note: Absolute paths are allowed since this is a localhost-only server
 * and users should be able to specify any valid path on their system.
 *
 * @param inputPath - Path to check
 * @returns true if path traversal detected
 *
 * @example
 * ```ts
 * isPathTraversal('../../etc/passwd')  // true
 * isPathTraversal('/etc/passwd')        // false (absolute path OK for localhost)
 * isPathTraversal('~/secret.txt')       // true
 * isPathTraversal('./epubs')            // false
 * isPathTraversal('/Users/ilia/books')  // false (absolute path OK)
 * ```
 */
export function isPathTraversal(inputPath: string): boolean {
  const normalized = inputPath.replace(/\\/g, '/');
  return normalized.includes('..') ||
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
 * Get workspace root directory
 *
 * The server runs from server/ directory, but paths should be resolved
 * relative to the workspace root (parent of server/).
 *
 * @returns Absolute path to workspace root
 */
function getWorkspaceRoot(): string {
  // Server runs from workspace-root/server/
  // Go up one level to get workspace root
  const serverDir = process.cwd();
  return path.resolve(serverDir, '..');
}

/**
 * Validate and resolve a path
 *
 * Performs security checks and filesystem validation:
 * 1. Checks for path traversal attempts
 * 2. Resolves relative paths to workspace root
 * 3. Verifies path exists
 * 4. Confirms it's a file or directory
 *
 * Note: Relative paths (./epubs) are resolved relative to workspace root,
 * not server directory. Absolute paths are used as-is.
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

  // Resolve path
  // - Absolute paths are used as-is
  // - Relative paths are resolved relative to workspace root
  let resolved: string;
  if (path.isAbsolute(inputPath)) {
    resolved = inputPath;
  } else {
    const workspaceRoot = getWorkspaceRoot();
    resolved = path.resolve(workspaceRoot, inputPath);
  }

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
