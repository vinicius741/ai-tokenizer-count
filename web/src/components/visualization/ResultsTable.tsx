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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenRangeSlider } from './TokenRangeSlider';
import { useTableData } from '@/hooks/use-table-data';
import { useCsvExport } from '@/lib/csv-export';
import type { EpubResult } from '@epub-counter/shared';

/**
 * Component props
 */
export interface ResultsTableProps {
  data: EpubResult[];
  tokenizers: string[];
  primaryTokenizer: string;
  isLoading?: boolean;
}

/**
 * ResultsTableSkeleton - Loading placeholder for ResultsTable
 *
 * Matches the exact structure of ResultsTable to prevent layout shift.
 */
function ResultsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-sm mt-4" />
        <Skeleton className="h-6 w-full mt-4" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto lg:overflow-hidden">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {[0, 1, 2, 3].map((i) => (
                    <th
                      key={i}
                      className="px-2 py-2 lg:px-4 lg:py-3 text-left"
                    >
                      <Skeleton className="h-4 w-24" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4].map((row) => (
                  <tr key={row} className="border-b">
                    {[0, 1, 2, 3].map((cell) => (
                      <td
                        key={cell}
                        className="px-2 py-2 lg:px-4 lg:py-4"
                      >
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
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
  isLoading = false,
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
  const { CSVDownloader, csvData, filename } = useCsvExport({
    data,
    tokenizers,
  });

  const CSVComponent = CSVDownloader as any;

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

  // Show skeleton while loading
  if (isLoading) {
    return <ResultsTableSkeleton />;
  }

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
              className={`min-h-[44px] ${showSearch ? 'bg-accent' : ''}`}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* CSV export button */}
            <CSVComponent data={csvData} filename={filename}>
              <Button variant="outline" size="sm" asChild>
                <span className="min-h-[44px] flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </span>
              </Button>
            </CSVComponent>
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
        <div className="overflow-x-auto lg:overflow-hidden">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-2 py-2 lg:px-4 lg:py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent/50 transition-colors select-none"
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
                        className="px-2 py-2 lg:px-4 lg:py-4 text-sm"
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
          </div>

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
