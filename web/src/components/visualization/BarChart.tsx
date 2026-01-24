/**
 * BarChart Component
 *
 * Per-tokenizer bar chart showing token counts per EPUB with sorting toggle.
 * Each tokenizer gets its own chart with color-coded bars.
 */

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getTokenizerColor } from '@/lib/chart-utils';
import { CustomTooltip } from './CustomTooltip';
import type { EpubResult, TokenizerResult } from '@epub-counter/shared';

interface TokenizerBarChartProps {
  /** Array of EPUB results from processing */
  data: EpubResult[];
  /** Tokenizer name (e.g., "gpt4", "claude", "hf:bert-base-uncased") */
  tokenizerName: string;
  /** Show loading skeleton */
  isLoading?: boolean;
}

/**
 * BarChartSkeleton - Loading placeholder for BarChart
 *
 * Matches the chart dimensions to prevent layout shift.
 */
function BarChartSkeleton() {
  return (
    <div className="space-y-4">
      {/* Sort toggle button skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Chart area skeleton */}
      <div className="h-[300px] w-full">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Bar chart showing token counts per EPUB for a specific tokenizer
 *
 * Features:
 * - Sortable bars (ascending/descending toggle button)
 * - Color-coded by tokenizer
 * - Custom tooltip with full metadata
 * - Angled x-axis labels to prevent overlap
 * - Filters out failed EPUBs (those with error property)
 */
export function TokenizerBarChart({
  data,
  tokenizerName,
  isLoading = false,
}: TokenizerBarChartProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Show skeleton while loading
  if (isLoading) {
    return <BarChartSkeleton />;
  }

  // Transform data: filter out errors, map to chart format, sort by token count
  const chartData = useMemo(() => {
    // Filter out failed EPUBs and map to chart data format
    const validData = data
      .filter((result) => !result.error)
      .map((result) => {
        // Find token count for this specific tokenizer
        const tokenCount =
          result.tokenCounts.find((t: TokenizerResult) => t.name === tokenizerName)
            ?.count ?? 0;

        return {
          name: result.metadata.title,
          value: tokenCount,
          metadata: result,
        };
      });

    // Sort by token count based on current sort order
    return validData.sort((a, b) =>
      sortOrder === 'asc' ? a.value - b.value : b.value - a.value
    );
  }, [data, tokenizerName, sortOrder]);

  // Get color for this tokenizer
  const color = getTokenizerColor(tokenizerName);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No valid data available for this tokenizer
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort toggle button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSort}
          className="gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sort {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </Button>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill={color}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TokenizerBarChart;
