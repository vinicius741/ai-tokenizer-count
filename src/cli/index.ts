#!/usr/bin/env node
/**
 * CLI Entry Point
 *
 * Command-line interface for epub-counter using commander.
 * Accepts EPUB files or folders as input, processes them, and displays
 * results in a formatted table.
 *
 * Usage:
 *   epub-counter                    # Process ./epubs/ (default)
 *   epub-counter path/to/book.epub  # Process single file
 *   epub-counter ./books/           # Process directory (flat)
 *   epub-counter -r ./books/        # Process directory (recursive)
 *   epub-counter -i ./books/ -o ./output/  # Custom paths
 */

import { Command } from 'commander';
import path from 'path';
import { discoverEpubFiles } from '../file-discovery/scanner.js';
import { parseEpubFile } from '../epub/parser.js';
import { extractMetadata } from '../epub/metadata.js';
import { extractText, countWords } from '../epub/text.js';
import { displayResults, type EpubResult } from '../output/table.js';

/**
 * Process EPUB files and display results
 *
 * @param inputPaths - Array of file or folder paths to process
 * @param options - CLI options from commander
 */
async function processEpubs(inputPaths: string[], options: any): Promise<void> {
  const results: EpubResult[] = [];

  // Default to ./epubs/ if no paths provided
  const pathsToProcess = inputPaths.length > 0 ? inputPaths : ['./epubs/'];

  // Discover EPUB files from each input path
  for (const inputPath of pathsToProcess) {
    const epubFiles = await discoverEpubFiles(inputPath, {
      recursive: options.recursive,
      includeHidden: false,
    });

    // Process each EPUB file
    for (const filePath of epubFiles) {
      // Parse EPUB
      const parseResult = await parseEpubFile(filePath);

      // Extract metadata
      const metadata = extractMetadata(parseResult.info);

      // Extract text and count words
      const text = extractText(parseResult.sections);
      const wordCount = countWords(text);

      // Get filename from path
      const filename = path.basename(filePath);

      // Store result
      results.push({
        filename,
        wordCount,
        title: metadata.title,
        author: metadata.author,
      });
    }
  }

  // Display results in table
  displayResults(results, { verbose: options.verbose });
}

/**
 * Setup and run the CLI program
 */
const program = new Command();

program
  .name('epub-counter')
  .description('Count words in EPUB files')
  .version('1.0.0')
  .argument('[paths...]', 'Input files or folders (default: ./epubs/)')
  .option('-i, --input <path>', 'Input folder or file path')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-r, --recursive', 'Scan subdirectories recursively')
  .option('-o, --output <path>', 'Output folder path (default: ./results/)')
  .action((paths, options) => {
    // Handle input precedence:
    // 1. If --input provided, use only that
    // 2. Else if paths provided (positional), use those
    // 3. Else use default ./epubs/
    const inputPaths = options.input
      ? [options.input]
      : paths.length > 0
        ? paths
        : ['./epubs/'];

    // Store output path for use in Plan 04 (writeResultsFile/writeJsonFile)
    // For now, just store it - will be used in next plan
    const outputPath = options.output || './results/';

    if (options.verbose) {
      console.log('Input paths:', inputPaths);
      console.log('Output path:', outputPath);
    }

    // Process EPUBs
    processEpubs(inputPaths, options).catch((error) => {
      // No error handling in this plan - let it crash (Plan 04 adds error handling)
      console.error('Error processing EPUBs:', error);
      process.exit(1);
    });
  });

// Parse command line arguments
program.parse();
