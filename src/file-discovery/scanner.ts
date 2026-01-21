/**
 * EPUB File Discovery Scanner
 *
 * Scans directories and files to find EPUB files.
 * Supports flat and recursive scanning, with option to include hidden files.
 *
 * Key features:
 * - Case-insensitive .epub extension matching
 * - Hidden file/folder filtering (files starting with .)
 * - Recursive directory scanning using Node.js fs.readdir recursive option
 * - Graceful handling of permission errors
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Options for controlling file discovery behavior
 */
export interface FileDiscoveryOptions {
  /**
   * Whether to scan subdirectories recursively
   * @default false
   */
  recursive?: boolean;

  /**
   * Whether to include hidden files and folders (names starting with .)
   * @default false - hidden files/folders are skipped
   */
  includeHidden?: boolean;
}

/**
 * Default options for file discovery
 */
const DEFAULT_OPTIONS: FileDiscoveryOptions = {
  recursive: false,
  includeHidden: false,
};

/**
 * Discover EPUB files in a directory or validate a single file
 *
 * Scans the input path for EPUB files:
 * - If inputPath is a file: returns single-element array if it has .epub extension
 * - If inputPath is a directory: scans for .epub files (flat or recursive)
 *
 * Extension matching is case-insensitive to catch files like "BOOK.EPUB" or "Book.Epub".
 *
 * @param inputPath - Path to file or directory to scan
 * @param options - Options controlling discovery behavior
 * @returns Promise resolving to array of absolute file paths
 *
 * @example
 * ```ts
 * // Scan single directory (flat)
 * const epubs = await discoverEpubFiles('./books', { recursive: false });
 *
 * // Scan recursively including hidden files
 * const allEpubs = await discoverEpubFiles('./books', { recursive: true, includeHidden: true });
 *
 * // Validate single file
 * const isEpub = await discoverEpubFiles('./book.epub');
 * ```
 */
export async function discoverEpubFiles(
  inputPath: string,
  options: FileDiscoveryOptions = {}
): Promise<string[]> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const stat = await fs.stat(inputPath);

    // Single file mode
    if (stat.isFile()) {
      if (inputPath.toLowerCase().endsWith('.epub')) {
        return [inputPath];
      }
      return [];
    }

    // Directory mode
    if (stat.isDirectory()) {
      return await scanDirectory(inputPath, mergedOptions);
    }

    // Not a file or directory (e.g., symbolic link, special device)
    return [];
  } catch (error) {
    // Handle permission errors gracefully
    if (error instanceof Error) {
      if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
        console.error(`Warning: Permission denied accessing '${inputPath}'`);
        return [];
      }
      if (error.message.includes('ENOENT')) {
        console.error(`Warning: Path does not exist '${inputPath}'`);
        return [];
      }
    }
    throw error;
  }
}

/**
 * Scan a directory for EPUB files
 *
 * Uses Node.js fs.readdir with recursive option for efficient subdirectory scanning.
 * Follows Pattern 3 from RESEARCH.md for recursive directory scanning.
 *
 * @param dirPath - Directory path to scan
 * @param options - Discovery options
 * @returns Promise resolving to array of absolute EPUB file paths
 */
async function scanDirectory(
  dirPath: string,
  options: FileDiscoveryOptions
): Promise<string[]> {
  const epubFiles: string[] = [];

  try {
    // Use Node.js built-in recursive option (Pattern 3 from RESEARCH.md)
    const entries = await fs.readdir(dirPath, {
      withFileTypes: true,
      recursive: options.recursive,
    });

    for (const entry of entries) {
      // Skip hidden files/folders if configured
      if (!options.includeHidden && entry.name.startsWith('.')) {
        continue;
      }

      // Filter for .epub files (case-insensitive to avoid Pitfall 4)
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.epub')) {
        // entry.path contains the directory path, entry.name is the filename
        // Join them to get the full file path
        const fullPath = path.join(entry.path || dirPath, entry.name);
        epubFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Handle permission errors on individual directories
    if (error instanceof Error) {
      if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
        console.error(`Warning: Permission denied reading directory '${dirPath}'`);
        return epubFiles;
      }
    }
    throw error;
  }

  return epubFiles;
}
