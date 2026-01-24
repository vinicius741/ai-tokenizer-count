/**
 * ChartContainer Component
 *
 * Card wrapper that provides consistent layout for all chart visualizations.
 * Wraps content in shadcn/ui Card with ResponsiveContainer for responsive sizing.
 */

import type { ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { ResponsiveContainer, type ResponsiveContainerProps } from 'recharts';

interface ChartContainerProps {
  /** Chart title displayed in CardHeader */
  title: string;
  /** Chart content to render */
  children: ReactNode;
  /** Optional height for the chart container */
  height?: ResponsiveContainerProps['height'];
}

/**
 * Container component for chart visualizations
 *
 * Provides:
 * - Card with header and title
 * - ResponsiveContainer for automatic chart resizing
 * - Consistent spacing and layout
 *
 * @example
 * ```tsx
 * <ChartContainer title="GPT-4 Token Counts">
 *   <BarChart data={data} {...chartProps} />
 * </ChartContainer>
 * ```
 */
export function ChartContainer({
  title,
  children,
  height = 300,
}: ChartContainerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto lg:overflow-x-visible">
          <div className="min-w-[600px]">
            <ResponsiveContainer width="99%" height={height}>
              {children}
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChartContainer;
