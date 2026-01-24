/**
 * Scatter Chart Component
 *
 * Visualizes word count vs token count density with linear regression
 * trend lines per tokenizer using Recharts ScatterChart.
 */

import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush
} from 'recharts';
import { groupBy, getTokenizerColor, formatNumber } from '@/lib/chart-utils';
import type { EpubResult } from '@epub-counter/shared';

interface ScatterPoint {
  /** Word count (x-axis) */
  x: number;
  /** Token count (y-axis) */
  y: number;
  /** Tokenizer name for grouping */
  z: string;
  /** Full EPUB result for tooltip */
  metadata: EpubResult;
}

interface TokenDensityScatterProps {
  /** Results from EPUB processing */
  data: EpubResult[];
  /** List of tokenizer names to plot */
  tokenizers: string[];
}

/**
 * Custom tooltip for scatter plot
 *
 * Shows word count, token count, ratio, and EPUB metadata on hover
 */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload as ScatterPoint;
  const { wordCount, tokenCounts, metadata } = data.metadata;

  // Find the tokenizer that this point represents
  const tokenizerResult = tokenCounts.find(t => t.name === data.z);
  const tokenCount = tokenizerResult?.count ?? 0;
  const ratio = wordCount > 0 ? (tokenCount / wordCount).toFixed(2) : '0.00';

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      <p className="font-semibold text-sm mb-1">{metadata.title}</p>
      <p className="text-xs text-muted-foreground mb-2">{metadata.author}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Words:</span>
          <span className="font-medium">{formatNumber(wordCount)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Tokens ({data.z}):</span>
          <span className="font-medium">{formatNumber(tokenCount)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Ratio:</span>
          <span className="font-medium">{ratio} tokens/word</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
        {metadata.filePath}
      </p>
    </div>
  );
}

/**
 * Token Density Scatter Plot
 *
 * Shows word count (x-axis) vs token count (y-axis) for all EPUBs,
 * with separate series per tokenizer and linear regression trend lines.
 */
export function TokenDensityScatter({ data, tokenizers }: TokenDensityScatterProps) {
  // Transform data into scatter points
  const scatterData = useMemo(() => {
    // Filter out failed results
    const validResults = data.filter(r => !r.error);

    // Map each result to multiple scatter points (one per tokenizer)
    const points: ScatterPoint[] = validResults.flatMap(result => {
      return tokenizers.map(tokenizerName => {
        const tokenCount = result.tokenCounts.find(
          t => t.name === tokenizerName
        )?.count ?? 0;

        return {
          x: result.wordCount,
          y: tokenCount,
          z: tokenizerName,
          metadata: result
        };
      });
    });

    return points;
  }, [data, tokenizers]);

  // Group points by tokenizer for separate Scatter series
  const groupedData = useMemo(() => {
    return groupBy(scatterData, 'z' as keyof ScatterPoint);
  }, [scatterData]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <XAxis
          dataKey="x"
          name="Words"
          label={{ value: 'Word Count', position: 'insideBottom', offset: -5 }}
          type="number"
          scale="linear"
          domain={['dataMin', 'dataMax']}
        />
        <YAxis
          dataKey="y"
          name="Tokens"
          label={{ value: 'Token Count', angle: -90, position: 'insideLeft' }}
          type="number"
          scale="linear"
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ strokeDasharray: '3 3' }}
        />
        <Legend />

        {/* Render separate Scatter series for each tokenizer */}
        {Object.entries(groupedData).map(([tokenizerName, points]) => {
          const color = getTokenizerColor(tokenizerName);

          return (
            <Scatter
              key={tokenizerName}
              name={tokenizerName}
              data={points}
              fill={color}
              line={{
                stroke: color,
                strokeWidth: 2
              }}
              lineType="fitting"
              shape="circle"
              r={5}
              fillOpacity={1}
              stroke="white"
              strokeWidth={2}
            />
          );
        })}

        {/* Brush component for zoom/pan on x-axis */}
        <Brush
          dataKey="x"
          height={30}
          stroke="#8884d8"
          fill="#e0e7ff"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export default TokenDensityScatter;
