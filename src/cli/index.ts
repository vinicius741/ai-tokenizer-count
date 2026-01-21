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
import { createProgressBars, createBar, updateProgress, stopAll } from './progress.js';
import cliProgress from 'cli-progress';
import path from 'path';

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

  // Create progress bar multibar
  const multibar = createProgressBars();
  const bars = new Map<string, cliProgress.Bar>();

  // Create bars for all files upfront (sequential processing)
  for (const file of allFiles) {
    const filename = path.basename(file);
    bars.set(filename, createBar(multibar, filename));
  }

  // Process EPUBs with error handling
  // FATAL errors will be thrown and caught below, exiting without summary
  // ERROR/WARN errors continue to summary display
  let result: any = undefined;
  try {
    for (const file of allFiles) {
      const filename = path.basename(file);
      const bar = bars.get(filename);

      // Update to 50% (parsing stage)
      if (bar) updateProgress(bar, 50);

      // Process single file
      const fileResult = await processEpubsWithErrors(
        [file],
        false, // Disable verbose during progress to avoid contamination
        outputDir,
        tokenizers,
        maxMb
      );

      // Update to 100% (complete)
      if (bar) updateProgress(bar, 100);

      // Collect results for final display
      if (!result) {
        result = fileResult;
      } else {
        result.successful.push(...fileResult.successful);
        result.failed.push(...fileResult.failed);
        result.total += fileResult.total;
        // Merge token counts
        for (const [key, value] of fileResult.tokenCounts) {
          result.tokenCounts.set(key, value);
        }
      }
    }
  } catch (error) {
    // Stop progress bars before error output
    stopAll(multibar);

    // FATAL error - exit without summary
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\nFatal error: ${errorMessage}`);
    console.error('Processing stopped.');
    process.exit(1);
    return; // Never reached, but satisfies TypeScript
  }

  // Stop all progress bars
  stopAll(multibar);

  // Display successful EPUBs in table
  // result is guaranteed to be defined here since allFiles.length > 0 (checked above)
  displayResults(result!.successful, { verbose: options.verbose });

  // Generate and write markdown results file
  const mdPath = await writeResultsFile(result!, { outputDir });

  // Generate and write JSON results file with token counts
  const jsonPath = await writeJsonFile(result!, { outputDir }, result!.tokenCounts);

  // Display results file paths
  console.log(`\nResults saved to:`);
  console.log(`- ${mdPath}`);
  console.log(`- ${jsonPath}`);

  // Display error summary
  console.log(`\nSummary:`);
  console.log(`- Total EPUBs: ${result!.total}`);
  console.log(`- Successful: ${result!.successful.length}`);
  console.log(`- Failed: ${result!.failed.length}`);

  // List failed files if verbose mode
  if (options.verbose && result!.failed.length > 0) {
    console.log('\nFailed files:');
    for (const failure of result!.failed) {
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
    // FATAL errors exit immediately via process.exit(1) in processEpubs
    processEpubs(inputPaths, { ...options, tokenizers, maxMb }).catch((error) => {
      // Fallback error handler for unexpected errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Unexpected error: ${errorMessage}`);
      process.exit(1);
    });
  });

// Parse command line arguments
program.parse();
