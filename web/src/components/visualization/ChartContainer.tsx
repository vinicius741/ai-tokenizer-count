/**
 * Chart Container Component
 *
 * Wrapper component that provides consistent Card-based layout
 * for all chart visualizations in the app.
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface ChartContainerProps {
  /** Chart title displayed in CardHeader */
  title: string;
  /** Chart component to render */
  children: ReactNode;
}

/**
 * ChartContainer wraps chart components in a shadcn/ui Card
 * with a consistent title header layout
 */
export function ChartContainer({ title, children }: ChartContainerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default ChartContainer;
