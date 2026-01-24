/**
 * CSV Export Utilities
 *
 * Provides functions to export results data to CSV format using react-papaparse.
 */

import { useCSVDownloader, Type } from 'react-papaparse';
import type { EpubResult } from '@epub-counter/shared';

/**
 * Row structure for CSV export
 */
interface CsvRow {
  title: string;
  author: string;
  wordCount: number;
  filePath: string;
  [tokenizerName: string]: string | number;
}

/**
 * Transform EpubResult[] to flat CSV rows
 */
function transformToCsvRows(results: EpubResult[], tokenizers: string[]): CsvRow[] {
  return results
    .filter((result) => !result.error) // Filter out failed results
    .map((result) => {
      const row: CsvRow = {
        title: result.metadata.title,
        author: result.metadata.author,
        wordCount: result.wordCount,
        filePath: result.filePath,
      };

      // Add token count columns for each tokenizer
      tokenizers.forEach((tokenizer) => {
        const tokenCount = result.tokenCounts.find(
          (t) => t.name === tokenizer
        )?.count ?? 0;
        row[`${tokenizer} tokens`] = tokenCount;
      });

      return row;
    });
}

/**
 * Generate default filename with timestamp
 */
function generateFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `epub-results-${timestamp}.csv`;
}

/**
 * Props for CSV export
 */
export interface CsvExportProps {
  data: EpubResult[];
  tokenizers: string[];
  filename?: string;
}

/**
 * CSV Export Hook
 *
 * Returns a CSVDownloader component that can be rendered in the UI.
 *
 * @param props - CSV export configuration
 * @returns CSVDownloader component from react-papaparse
 *
 * @example
 * ```tsx
 * const CSVDownloader = useCsvExport({
 *   data: results,
 *   tokenizers: ['gpt4', 'claude'],
 *   filename: 'my-results.csv'
 * });
 *
 * return <CSVDownloader>Export to CSV</CSVDownloader>;
 * ```
 */
export function useCsvExport(props: CsvExportProps) {
  const { data, tokenizers, filename = generateFilename() } = props;

  const csvRows = transformToCsvRows(data, tokenizers);

  return useCSVDownloader({
    data: csvRows,
    filename,
    type: Type.Button,
    className: 'csv-downloader',
  });
}

/**
 * Direct export function for programmatic use
 *
 * This is a simpler alternative that returns the CSVDownloader component
 * without needing to use a hook. Use this when you need to export from
 * outside a React component.
 *
 * @param props - CSV export configuration
 * @returns CSVDownloader component
 */
export function exportToCSV(props: CsvExportProps) {
  return useCsvExport(props);
}
