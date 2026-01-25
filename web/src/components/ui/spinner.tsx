import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg'
}

const sizeClasses = {
  default: 'h-4 w-4',
  sm: 'h-3 w-3',
  lg: 'h-6 w-6'
}

export function Spinner({ className, size = 'default' }: SpinnerProps) {
  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  )
}
