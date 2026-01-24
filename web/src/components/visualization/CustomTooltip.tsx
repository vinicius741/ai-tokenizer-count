/**
 * CustomTooltip Component
 *
 * Shared tooltip component for all Recharts visualizations.
 * Displays rich metadata when hovering over chart elements.
 */

import type { TooltipProps } from 'recharts';
import type { EpubResult, TokenizerResult } from '@epub-counter/shared';

interface PayloadItem {
  name: string;
  value: number;
  payload: {
    metadata: EpubResult;
    [key: string]: unknown;
  };
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  // Recharts Tooltip props
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
}

/**
 * Custom tooltip for chart hover states
 *
 * Shows EPUB metadata including title, author, word count,
 * token count, and file path in a styled card.
 */
export function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload.metadata as EpubResult;
  const tokenValue = payload[0].value;
  const tokenizerName = payload[0].name;

  if (!data) {
    return null;
  }

  // Extract token count for the specific tokenizer
  const tokenCount = data.tokenCounts.find(
    (t: TokenizerResult) => t.name === tokenizerName
  )?.count ?? tokenValue;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      {/* Title - bold */}
      <p className="font-semibold text-sm">{data.metadata.title}</p>

      {/* Author - muted */}
      <p className="text-muted-foreground text-xs">{data.metadata.author}</p>

      {/* Divider */}
      <div className="my-2 border-t" />

      {/* Token count - bold with formatting */}
      <p className="text-sm">
        Tokens:{' '}
        <strong className="text-base">{tokenCount.toLocaleString()}</strong>
      </p>

      {/* Word count */}
      <p className="text-sm">Words: {data.wordCount.toLocaleString()}</p>

      {/* File path - muted, smaller */}
      <p className="text-muted-foreground mt-1 text-xs" title={data.filePath}>
        {data.filePath.length > 40
          ? `...${data.filePath.slice(-37)}`
          : data.filePath}
      </p>
    </div>
  );
}
