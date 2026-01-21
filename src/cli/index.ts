#!/usr/bin/env node
/**
 * CLI Entry Point
 *
 * Command-line interface for epub-counter using commander.
 * Accepts EPUB files or folders as input, processes them with error handling,
 * displays results in a formatted table, and generates markdown/JSON output files.
 *
 * Usage:
 *   epub-counter                    # Process ./epubs/ (default)
 *   epub-counter path/to/book.epub  # Process single file
 *   epub-counter ./books/           # Process directory (flat)
 *   epub-counter -r ./books/        # Process directory (recursive)
 *   epub-counter -i ./books/ -o ./output/  # Custom paths
 */

import { Command } from 'commander';
import { discoverEpubFiles } from '../file-discovery/scanner.js';
import { processEpubsWithErrors } from '../errors/handler.js';
import { displayResults } from '../output/table.js';
import { writeResultsFile } from '../output/markdown.js';
import { writeJsonFile } from '../output/json.js';

/**
 * Process EPUB files with error handling and generate results files
 *
 * @param inputPaths - Array of file or folder paths to process
 * @param options - CLI options from commander
 */
async function processEpubs(inputPaths: string[], options: any): Promise<void> {
  // Default to ./epubs/ if no paths provided
  const pathsToProcess = inputPaths.length > 0 ? inputPaths : ['./epubs/'];

  // Collect all EPUB files from input paths
  const allFiles: string[] = [];
  for (const inputPath of pathsToProcess) {
    const epubFiles = await discoverEpubFiles(inputPath, {
      recursive: options.recursive,
      includeHidden: false,
    });
    allFiles.push(...epubFiles);
  }

  // Handle "no EPUBs found" case
  if (allFiles.length === 0) {
    console.log('No EPUB files found.');
    return;
  }

  // Determine output directory (from --output flag or default)
  const outputDir = options.output || './results';

  // Extract tokenizers and maxMb from options
  const tokenizers = options.tokenizers || ['gpt4'];
  const maxMb = options.maxMb || 500;

  // Process EPUBs with error handling (continue-on-error)
  const result = await processEpubsWithErrors(
    allFiles,
    options.verbose,
    outputDir,
    tokenizers,
    maxMb
  );

  // Display successful EPUBs in table
  displayResults(result.successful, { verbose: options.verbose });

  // Generate and write markdown results file
  const mdPath = await writeResultsFile(result, { outputDir });

  // Generate and write JSON results file with token counts
  const jsonPath = await writeJsonFile(result, { outputDir }, result.tokenCounts);

  // Display results file paths
  console.log(`\nResults saved to:`);
  console.log(`- ${mdPath}`);
  console.log(`- ${jsonPath}`);

  // Display error summary
  console.log(`\nSummary:`);
  console.log(`- Total EPUBs: ${result.total}`);
  console.log(`- Successful: ${result.successful.length}`);
  console.log(`- Failed: ${result.failed.length}`);

  // List failed files if verbose mode
  if (options.verbose && result.failed.length > 0) {
    console.log('\nFailed files:');
    for (const failure of result.failed) {
      console.log(`  - ${failure.file}: ${failure.error}`);
    }
  }
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
  .option('-t, --tokenizers <list>', 'Comma-separated list of tokenizers (e.g., gpt4,claude,hf:bert-base-uncased)', 'gpt4')
  .option('--max-mb <size>', 'Maximum EPUB text size in MB (default: 500)', '500')
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

    // Determine output directory (CLI-05: --output flag support)
    const outputDir = options.output || './results';

    // Parse tokenizers list
    const tokenizers = options.tokenizers.split(',').map((t: string) => t.trim());

    // Parse maxMb as integer
    const maxMb = parseInt(options.maxMb || '500', 10);
    if (isNaN(maxMb) || maxMb <= 0) {
      console.error('Error: --max-mb must be a positive number');
      process.exit(1);
    }

    if (options.verbose) {
      console.log('Input paths:', inputPaths);
      console.log('Output directory:', outputDir);
      console.log('Tokenizers:', tokenizers);
      console.log('Max MB:', maxMb);
    }

    // Process EPUBs with error handling
    processEpubs(inputPaths, { ...options, tokenizers, maxMb }).catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
  });

// Parse command line arguments
program.parse();
