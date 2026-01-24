/**
 * Results Table Component
 *
 * Sortable and filterable data table with TanStack Table.
 * Features text search, token range filtering, and CSV export.
 */

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { Search, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenRangeSlider } from './TokenRangeSlider';
import { useTableData, type TableData } from '@/hooks/use-table-data';
import { useCsvExport } from '@/lib/csv-export';
import type { EpubResult } from '@epub-counter/shared';

/**
 * Component props
 */
export interface ResultsTableProps {
  data: EpubResult[];
  tokenizers: string[];
  primaryTokenizer: string;
}

/**
 * Results Table
 *
 * Displays sortable and filterable table of EPUB processing results.
 *
 * Features:
 * - Click column headers to sort ascending/descending
 * - Search icon toggles collapsible text input filter
 * - Range slider filters by token count
 * - Export to CSV button downloads filtered data
 * - Default sort by primary tokenizer token count descending
 *
 * @param props - Component props
 * @returns React component
 *
 * @example
 * ```tsx
 * <ResultsTable
 *   data={results}
 *   tokenizers={['gpt4', 'claude']}
 *   primaryTokenizer="gpt4"
 * />
 * ```
 */
export function ResultsTable({
  data,
  tokenizers,
  primaryTokenizer,
}: ResultsTableProps) {
  // Get transformed data and column definitions
  const { data: tableData, columns: columnDefs, minTokenCount, maxTokenCount } =
    useTableData({ results: data, tokenizers, primaryTokenizer });

  // Sorting state - default to primary tokenizer descending
  const [sorting, setSorting] = useState<SortingState>([
    { id: primaryTokenizer, desc: true },
  ]);

  // Global filter state for text search
  const [globalFilter, setGlobalFilter] = useState('');

  // Show/hide search input
  const [showSearch, setShowSearch] = useState(false);

  // Token range filter state
  const [tokenRange, setTokenRange] = useState<[number, number]>([
    minTokenCount,
    maxTokenCount,
  ]);

  // Create CSV downloader
  const CSVDownloader = useCsvExport({
    data,
    tokenizers,
  });

  // Filter data by token range
  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      const tokenCount = (row[primaryTokenizer] as number) ?? 0;
      return tokenCount >= tokenRange[0] && tokenCount <= tokenRange[1];
    });
  }, [tableData, tokenRange, primaryTokenizer]);

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  const headers = table.getFlatHeaders();
  const rows = table.getRowModel().rows;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Detailed Results</CardTitle>
          <div className="flex items-center gap-2">
            {/* Search toggle button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className={showSearch ? 'bg-accent' : ''}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* CSV export button */}
            <CSVDownloader>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </span>
              </Button>
            </CSVDownloader>
          </div>
        </div>

        {/* Collapsible search input */}
        {showSearch && (
          <div className="mt-4">
            <Input
              placeholder="Search by title or author..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}

        {/* Token range slider */}
        {(minTokenCount !== maxTokenCount || tableData.length > 0) && (
          <div className="mt-4">
            <TokenRangeSlider
              min={minTokenCount}
              max={maxTokenCount}
              value={tokenRange}
              onChange={setTokenRange}
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent/50 transition-colors select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {/* Sort indicator */}
                      <span className="flex items-center">
                        {header.column.getIsSorted() === 'asc' && (
                          <ChevronUp className="h-4 w-4" />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-accent/30">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {rows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No results match your filters. Try adjusting your search or range.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
