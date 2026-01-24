/**
 * Token Range Slider Component
 *
 * Dual-handle slider for filtering table data by token count range.
 */

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

/**
 * Component props
 */
export interface TokenRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

/**
 * Token Range Slider
 *
 * Displays a dual-handle slider for filtering by token count range.
 * Includes labels showing current range and a reset button.
 *
 * @param props - Component props
 * @returns React component
 *
 * @example
 * ```tsx
 * <TokenRangeSlider
 *   min={0}
 *   max={100000}
 *   value={[10000, 50000]}
 *   onChange={(range) => console.log(range)}
 * />
 * ```
 */
export function TokenRangeSlider({
  min,
  max,
  value,
  onChange,
}: TokenRangeSliderProps) {
  const handleReset = () => {
    onChange([min, max]);
  };

  const isResetDisabled = value[0] === min && value[1] === max;

  return (
    <div className="space-y-3">
      {/* Slider */}
      <Slider
        min={0}
        max={max}
        step={1}
        value={value}
        onValueChange={(vals) => onChange([vals[0], vals[1]])}
        className="w-full"
      />

      {/* Labels and Reset Button */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Min: {value[0].toLocaleString()} tokens
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isResetDisabled}
          className="h-7 px-2"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>

        <span className="text-muted-foreground">
          Max: {value[1].toLocaleString()} tokens
        </span>
      </div>
    </div>
  );
}
