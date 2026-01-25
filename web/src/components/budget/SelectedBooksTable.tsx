/**
 * Selected Books Table Component
 *
 * TanStack Table displaying books selected by the budget calculator.
 * Features sortable columns for Title, Author, Words, and Tokens.
 */

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { Check, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { EpubResult } from '@epub-counter/shared';

interface SelectedBooksTableProps {
  /** Selected EPUB results */
  books: EpubResult[];
  /** Tokenizer name for token counts */
  tokenizer: string;
  /** Budget used (for display) */
  budget: number;
  /** Strategy used (for display) */
  strategy: string;
}

/**
 * Selected Books Table
 *
 * Displays a sortable table of selected EPUBs with columns:
 * - Select checkbox (disabled, shows selected state)
 * - Title (sortable)
 * - Author (sortable)
 * - Words (sortable, formatted with toLocaleString)
 * - Tokens (sortable, formatted with toLocaleString)
 *
 * Default sort: tokens descending
 *
 * @param props - Component props
 * @returns React component
 */
export function SelectedBooksTable({
  books,
  tokenizer,
}: // budget, strategy - passed for potential future use
SelectedBooksTableProps) {
  // Sorting state - default to tokens descending
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'tokens', desc: true },
  ]);

  // Column definitions
  const columns = useMemo<ColumnDef<EpubResult>[]>(
    () => [
      {
        id: 'select',
        header: 'Selected',
        cell: () => (
          <div className="flex items-center justify-center">
            <Check className="h-4 w-4 text-primary" />
          </div>
        ),
        size: 80,
      },
      {
        accessorFn: (row) => row.metadata.title,
        id: 'title',
        header: 'Title',
        cell: (info) => info.getValue() as string,
      },
      {
        accessorFn: (row) => row.metadata.author,
        id: 'author',
        header: 'Author',
        cell: (info) => info.getValue() as string,
      },
      {
        accessorFn: (row) => row.wordCount.toLocaleString(),
        id: 'words',
        header: 'Words',
        cell: (info) => <span className="tabular-nums">{info.getValue() as string}</span>,
      },
      {
        accessorFn: (row) => {
          const tokenCount = row.tokenCounts.find((t) => t.name === tokenizer)?.count ?? 0;
          return tokenCount.toLocaleString();
        },
        id: 'tokens',
        header: 'Tokens',
        cell: (info) => <span className="tabular-nums font-medium">{info.getValue() as string}</span>,
      },
    ],
    [tokenizer]
  );

  // Create table instance
  const table = useReactTable({
    data: books,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const headers = table.getFlatHeaders();
  const rows = table.getRowModel().rows;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected Books</CardTitle>
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
                    <td key={cell.id} className="px-4 py-4 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {rows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No books selected. Adjust your budget or strategy.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
