/**
 * ComparisonBarChart Component
 *
 * Side-by-side grouped bar chart showing token counts for each tokenizer
 * grouped by EPUB. This allows users to visually compare absolute token
 * counts between tokenizers for each book.
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { TOKENIZER_COLORS } from '@/lib/chart-utils';
import type { EpubResult, TokenizerResult } from '@epub-counter/shared';

interface ComparisonBarChartProps {
  /** Array of EPUB results from processing */
  data: EpubResult[];
  /** Tokenizer names to include in comparison */
  tokenizers: string[];
}

/**
 * Custom tooltip for comparison bar chart
 *
 * Shows EPUB title, tokenizer name, exact token count,
 * and percentage difference vs lowest tokenizer for this EPUB.
 */
interface ComparisonTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    payload?: {
      epubTitle?: string;
      tokenizers?: Record<string, number>;
      lowestCount?: number;
      [key: string]: unknown;
    };
  }>;
  label?: string;
}

function ComparisonTooltip({ active, payload }: ComparisonTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  if (!data || !data.epubTitle) {
    return null;
  }

  const epubTitle = data.epubTitle as string;
  const tokenizerName = payload[0].name;
  const tokenCount = payload[0].value;
  const lowestCount = (data.lowestCount as number) || tokenCount;

  // Calculate percentage vs lowest
  const percentage = lowestCount > 0
    ? ((tokenCount / lowestCount) * 100).toFixed(1)
    : '0.0';

  const percentageDiff = lowestCount > 0
    ? (((tokenCount - lowestCount) / lowestCount) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      {/* EPUB title - bold */}
      <p className="font-semibold text-sm">{epubTitle}</p>

      {/* Divider */}
      <div className="my-2 border-t" />

      {/* Tokenizer name - colored indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: payload[0].color }}
        />
        <p className="text-sm font-medium">{tokenizerName}</p>
      </div>

      {/* Token count - bold with formatting */}
      <p className="text-sm">
        Tokens:{' '}
        <strong className="text-base">{tokenCount.toLocaleString()}</strong>
      </p>

      {/* Percentage vs lowest */}
      <p className="text-xs text-muted-foreground mt-1">
        {percentage}% of lowest ({parseFloat(percentageDiff) >= 0 ? '+' : ''}{percentageDiff}%)
      </p>
    </div>
  );
}

/**
 * Side-by-side comparison bar chart
 *
 * Displays grouped bars for each EPUB, with one bar per tokenizer.
 * This makes it easy to compare absolute token counts between tokenizers
 * for each book, complementing the percentage-based heatmap view.
 *
 * Features:
 * - Grouped bars: Each EPUB has multiple bars (one per tokenizer)
 * - Tokenizer-specific colors matching other visualizations
 * - Custom tooltip with exact counts and percentage differences
 * - Limited to top 20 EPUBs by word count to prevent overcrowding
 * - Sorted alphabetically by EPUB title for consistency
 * - Only renders when 2+ tokenizers present (requires comparison)
 */
export function ComparisonBarChart({
  data,
  tokenizers,
}: ComparisonBarChartProps) {
  // Transform data for grouped bar chart
  const chartData = useMemo(() => {
    // Filter out failed EPUBs
    const validResults = data.filter((result) => !result.error);

    // Sort by word count descending and take top 20
    const topResults = validResults
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 20);

    // Sort alphabetically by title for consistent display
    const sortedByTitle = [...topResults].sort((a, b) =>
      a.metadata.title.localeCompare(b.metadata.title)
    );

    // Transform to chart data format
    return sortedByTitle.map((result) => {
      const tokenizerCounts: Record<string, number> = {};
      let lowestCount = Infinity;

      // Extract token counts for each tokenizer
      tokenizers.forEach((tokenizerName) => {
        const count =
          result.tokenCounts.find(
            (t: TokenizerResult) => t.name === tokenizerName
          )?.count ?? 0;
        tokenizerCounts[tokenizerName] = count;
        if (count > 0 && count < lowestCount) {
          lowestCount = count;
        }
      });

      return {
        epubTitle: result.metadata.title,
        wordCount: result.wordCount,
        ...tokenizerCounts,
        lowestCount: lowestCount === Infinity ? 0 : lowestCount,
      };
    });
  }, [data, tokenizers]);

  // Don't render if fewer than 2 tokenizers (comparison requires at least 2)
  if (tokenizers.length < 2) {
    return null;
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Count Comparison by EPUB</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          No valid data available for comparison
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Count Comparison by EPUB</CardTitle>
      </CardHeader>
      <div className="px-6 pb-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="epubTitle"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              label={{
                value: 'Token Count',
                angle: -90,
                position: 'insideLeft',
                fontSize: 12,
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={<ComparisonTooltip />}
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
            />
            <Legend />

            {/* Render one Bar series per tokenizer */}
            {tokenizers.map((tokenizer) => (
              <Bar
                key={tokenizer}
                dataKey={tokenizer}
                fill={TOKENIZER_COLORS[tokenizer] || TOKENIZER_COLORS.default}
                name={tokenizer}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default ComparisonBarChart;
