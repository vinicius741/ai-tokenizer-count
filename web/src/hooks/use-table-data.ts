/**
 * Table Data Hook
 *
 * Custom hook for transforming EpubResult[] into table data format
 * with column definitions for TanStack Table.
 */

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { EpubResult } from '@epub-counter/shared';

/**
 * Row structure for table display
 */
export interface TableData {
  title: string;
  author: string;
  wordCount: number;
  filePath: string;
  [key: string]: string | number;
}

/**
 * Hook options
 */
export interface UseTableDataOptions {
  results: EpubResult[];
  tokenizers: string[];
  primaryTokenizer: string;
}

/**
 * Hook return value
 */
export interface UseTableDataReturn {
  data: TableData[];
  columns: ColumnDef<TableData>[];
  minTokenCount: number;
  maxTokenCount: number;
}

/**
 * Transform EpubResult[] to TableData[] for TanStack Table
 */
function transformToTableData(
  results: EpubResult[],
  tokenizers: string[]
): TableData[] {
  return results
    .filter((result) => !result.error) // Filter out failed results
    .map((result) => {
      const row: TableData = {
        title: result.metadata.title,
        author: result.metadata.author,
        wordCount: result.wordCount,
        filePath: result.filePath,
      };

      // Add token count columns for each tokenizer
      tokenizers.forEach((tokenizer) => {
        row[tokenizer] =
          result.tokenCounts.find((t) => t.name === tokenizer)?.count ?? 0;
      });

      return row;
    });
}

/**
 * Calculate min/max token count for primary tokenizer
 */
function calculateTokenBounds(
  data: TableData[],
  primaryTokenizer: string
): { min: number; max: number } {
  if (data.length === 0) {
    return { min: 0, max: 0 };
  }

  const counts = data.map((row) => (row[primaryTokenizer] as number) ?? 0);
  return {
    min: Math.min(...counts),
    max: Math.max(...counts),
  };
}

/**
 * Create column definitions for TanStack Table
 */
function createColumns(tokenizers: string[]): ColumnDef<TableData>[] {
  // Base columns
  const baseColumns: ColumnDef<TableData>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: (info) => info.getValue() as string,
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: (info) => info.getValue() as string,
    },
    {
      accessorKey: 'wordCount',
      header: 'Words',
      cell: (info) => (info.getValue() as number).toLocaleString(),
    },
  ];

  // Tokenizer columns
  const tokenizerColumns: ColumnDef<TableData>[] = tokenizers.map(
    (tokenizer) => ({
      accessorKey: tokenizer,
      header: `${tokenizer} tokens`,
      cell: (info) => (info.getValue() as number).toLocaleString(),
    })
  );

  // File path column
  const filePathColumn: ColumnDef<TableData> = {
    accessorKey: 'filePath',
    header: 'File Path',
    cell: (info) => {
      const path = info.getValue() as string;
      // Truncate long paths
      if (path.length > 50) {
        return '...' + path.slice(-47);
      }
      return path;
    },
  };

  return [...baseColumns, ...tokenizerColumns, filePathColumn];
}

/**
 * Custom hook for table data transformation and column definitions
 *
 * @param options - Hook configuration
 * @returns Transformed data, columns, and token count bounds
 *
 * @example
 * ```tsx
 * const { data, columns, minTokenCount, maxTokenCount } = useTableData({
 *   results: epubResults,
 *   tokenizers: ['gpt4', 'claude'],
 *   primaryTokenizer: 'gpt4'
 * });
 * ```
 */
export function useTableData(
  options: UseTableDataOptions
): UseTableDataReturn {
  const { results, tokenizers, primaryTokenizer } = options;

  const data = useMemo(() => {
    return transformToTableData(results, tokenizers);
  }, [results, tokenizers]);

  const columns = useMemo(() => {
    return createColumns(tokenizers);
  }, [tokenizers]);

  const { min, max } = useMemo(() => {
    return calculateTokenBounds(data, primaryTokenizer);
  }, [data, primaryTokenizer]);

  return {
    data,
    columns,
    minTokenCount: min,
    maxTokenCount: max,
  };
}
