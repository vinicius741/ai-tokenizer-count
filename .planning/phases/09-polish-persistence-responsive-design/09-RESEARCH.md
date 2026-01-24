# Phase 09: Polish, Persistence & Responsive Design - Research

**Researched:** 2026-01-24
**Domain:** React state persistence, responsive design, error handling, UX polish
**Confidence:** HIGH

## Summary

This research covers the implementation of session persistence, responsive layout, error boundaries, and UX polish for the EPUB Tokenizer Counter web UI. The phase requires adding localStorage-based state persistence with restoration prompts, responsive layouts for mobile/tablet/desktop, error boundaries with friendly fallback UIs, skeleton loading states, toast notifications with timeout handling, and touch-friendly sizing.

**Key findings:**
- **State persistence:** Use existing `useLocalStorage` hook with auto-save on completion, restoration dialog on mount, and 5MB quota error handling
- **Responsive design:** Tailwind CSS mobile-first breakpoints (default: mobile, `md:` 768px, `lg:` 1024px) with grid/flex layout changes
- **Error boundaries:** React's class component `componentDidCatch` pattern with friendly fallback UI and retry buttons
- **Loading states:** shadcn/ui Skeleton component for layout stability, Spinner component for button loading states
- **Toast notifications:** Sonner library with 30-second timeout for error messages, duration prop in milliseconds
- **Touch targets:** Minimum 44x44px per iOS Human Interface Guidelines and WCAG 2.2

**Primary recommendation:** Implement localStorage persistence with QuotaExceededError handling, use Tailwind breakpoint prefixes for responsive layouts, create a reusable ErrorBoundary component with fallback UI, add Skeleton screens for data fetching, and ensure all buttons meet 44x44px minimum touch target size.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **React** | 19.x | UI library | Error boundaries require class components, React 19 has updated error handling |
| **Tailwind CSS** | 4.x | Responsive styling | Mobile-first breakpoint system with utility classes |
| **Sonner** | latest | Toast notifications | Already in package.json, supports custom duration prop |
| **shadcn/ui** | latest | Component library | Skeleton and Spinner components available via CLI |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **useLocalStorage hook** | existing | State persistence | Custom hook already in codebase at `web/src/hooks/use-local-storage.ts` |
| **react-error-boundary** | latest | Error boundary library | Optional, but vanilla React ErrorBoundary is sufficient |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **localStorage** | IndexedDB, localforage | localStorage is simpler for 5MB data; IndexedDB/localforage for larger datasets |
| **Tailwind breakpoints** | Custom CSS media queries | Tailwind utilities are consistent with existing UI, easier to maintain |
| **Skeleton screens** | Spinners only | Skeletons show content structure, reduce perceived wait time |
| **shadcn Sonner** | react-toastify | Sonner is already installed and integrated |

**Installation:**
```bash
# shadcn/ui components (if not already added)
npx shadcn@latest add skeleton
npx shadcn@latest add spinner

# Optional: react-error-boundary library
npm install react-error-boundary
```

## Architecture Patterns

### Recommended Project Structure

Phase 09 adds new components and utilities to the existing web UI structure:

```
web/src/
├── components/
│   ├── error-boundary/          # NEW: Error handling
│   │   └── ErrorBoundary.tsx    # Reusable error boundary component
│   ├── persistence/             # NEW: State persistence
│   │   ├── RestoreDialog.tsx    # Prompt to restore saved session
│   │   └── NewSessionButton.tsx # Clear localStorage button
│   ├── ui/
│   │   ├── skeleton.tsx         # NEW: Loading placeholder
│   │   └── spinner.tsx          # NEW: Loading indicator
│   └── [existing components]
├── hooks/
│   └── use-local-storage.ts     # EXISTING: Enhance with quota detection
└── lib/
    └── storage-utils.ts         # NEW: Quota checking, safe save/load
```

### Pattern 1: localStorage Persistence with Quota Detection

**What:** Auto-save processing results to localStorage with error handling for 5MB quota exceeded

**When to use:** When saving processing results that need to persist across page reloads

**Example:**
```typescript
// Source: Research based on localStorage QuotaExceededError patterns
import { useLocalStorage } from '@/hooks/use-local-storage'

const STORAGE_KEY = 'epub-counter-results'
const QUOTA_MB = 5

function App() {
  const [results, setResults] = useLocalStorage<ResultsOutput | null>(
    STORAGE_KEY,
    null
  )

  const handleSaveResults = (data: ResultsOutput) => {
    try {
      // Estimate size before saving
      const size = new Blob([JSON.stringify(data)]).size
      const sizeMB = size / (1024 * 1024)

      if (sizeMB > QUOTA_MB) {
        toast.error(`Results too large for localStorage (${sizeMB.toFixed(2)}MB)`, {
          description: 'Please download results instead',
          duration: 30000, // 30 seconds
        })
        return
      }

      setResults(data)
      toast.success('Results saved to browser')
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error('localStorage quota exceeded', {
          description: 'Cannot save results. Please download instead.',
          duration: 30000,
        })
      }
    }
  }

  return <div>{/* ... */}</div>
}
```

### Pattern 2: Restore Saved Session Dialog

**What:** Prompt user to restore previously saved results on page load

**When to use:** When localStorage contains saved results from previous session

**Example:**
```typescript
// Source: State persistence best practices (2025)
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function RestoreDialog({ hasSavedData, onRestore, onClear }: {
  hasSavedData: boolean
  onRestore: () => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (hasSavedData) {
      setOpen(true)
    }
  }, [hasSavedData])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Restore Previous Session?</DialogTitle>
        <DialogDescription>
          We found saved results from your last session. Would you like to restore them or start fresh?
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClear}>
            Start Fresh
          </Button>
          <Button onClick={() => {
            onRestore()
            setOpen(false)
          }}>
            Restore Results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Pattern 3: Responsive Layout with Tailwind Breakpoints

**What:** Mobile-first responsive design using Tailwind breakpoint prefixes

**When to use:** When layout needs to adapt to different screen sizes

**Example:**
```typescript
// Source: Tailwind CSS responsive design documentation
// Desktop (1024px+): Side-by-side charts
// Tablet (768px-1024px): Stacked layout
// Mobile (<768px): Single column with horizontal scroll for charts

function ResultsSection() {
  return (
    <div className="space-y-6">
      {/* Desktop: side-by-side, Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Token Counts">
          <TokenizerBarChart data={data} />
        </ChartContainer>
        <ChartContainer title="Token Density">
          <TokenDensityScatter data={data} />
        </ChartContainer>
      </div>

      {/* Mobile: horizontal scroll for charts */}
      <div className="lg:hidden overflow-x-auto">
        <div className="min-w-[600px]">
          <TokenizerBarChart data={data} />
        </div>
      </div>
    </div>
  )
}
```

### Pattern 4: Error Boundary with Fallback UI

**What:** Class component that catches rendering errors and displays friendly UI

**When to use:** Wrapping critical components or the entire app

**Example:**
```typescript
// Source: React Error Boundary documentation (legacy.reactjs.org)
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error stack to console (UX-06)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              An error occurred while rendering this component. Please try again.
            </p>
            <Button onClick={this.handleRetry} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
```

### Pattern 5: Skeleton Screens During Data Fetch

**What:** Show placeholder content matching the actual layout structure while data loads

**When to use:** During initial data fetch or async operations

**Example:**
```typescript
// Source: shadcn/ui Skeleton documentation
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function ResultsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Usage
function ResultsSection({ data, isLoading }) {
  if (isLoading) {
    return <ResultsTableSkeleton />
  }
  return <ResultsTable data={data} />
}
```

### Pattern 6: Button Loading States with Spinner

**What:** Show spinner inside button during async operations

**When to use:** On buttons that trigger async actions (process, export, etc.)

**Example:**
```typescript
// Source: shadcn/ui Spinner documentation
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

function ProcessButton({ isProcessing, onClick }: {
  isProcessing: boolean
  onClick: () => void
}) {
  return (
    <Button
      onClick={onClick}
      disabled={isProcessing}
      className="min-h-[44px] min-w-[44px]" // Touch target requirement
    >
      {isProcessing && <Spinner className="mr-2" />}
      {isProcessing ? 'Processing...' : 'Process EPUBs'}
    </Button>
  )
}
```

### Anti-Patterns to Avoid

- **sm: for mobile styling:** Use unprefixed classes for mobile, `sm:` only for small breakpoint and above
- **100% width for Recharts:** Use `99%` or `width="100%"` with container workaround to avoid display:none bug
- **QuotaExceededError silence:** Always catch and handle localStorage quota errors with user feedback
- **Infinite useEffect loops:** Don't update state inside useEffect without proper dependencies or guards
- **Touch targets smaller than 44px:** All interactive elements must meet minimum touch size for accessibility
- **Generic error messages:** Provide context-specific error messages with actionable recovery steps

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **localStorage persistence** | Custom JSON.parse/stringify logic | `useLocalStorage` hook (existing) | Handles SSR edge cases, parsing errors, state synchronization |
| **Toast notifications** | Custom toast component | Sonner (already installed) | Animated, accessible, position management, auto-dismiss |
| **Loading placeholders** | Custom CSS spinners | shadcn/ui Skeleton | Layout stability, matches content structure, reduces perceived wait |
| **Button loading states** | Manual disabled/text toggle | Spinner component + Button | Consistent loading indicator, better UX |
| **Error boundaries** | Try-catch in render | React ErrorBoundary pattern | Only way to catch render errors, can't use try-catch |
| **Responsive utilities** | Custom @media queries | Tailwind breakpoint prefixes | Consistent with existing UI, mobile-first, predictable |

**Key insight:** Modern React ecosystem has solved these UX problems. Use existing components and patterns rather than building from scratch.

## Common Pitfalls

### Pitfall 1: localStorage QuotaExceededError Crashes UI

**What goes wrong:** Attempting to save data exceeding 5MB causes uncaught QuotaExceededError, breaking UI

**Why it happens:** localStorage setItem throws when quota exceeded, but developers often don't catch this specific error

**How to avoid:** Wrap setItem in try-catch, check data size before saving, show user-friendly error message

**Warning signs:**
- Results work in dev but fail in production with larger datasets
- No error message but data doesn't persist
- Browser console shows QuotaExceededError

**Fix:**
```typescript
const safeSave = (key: string, value: unknown) => {
  try {
    const serialized = JSON.stringify(value)
    const size = new Blob([serialized]).size

    if (size > 5 * 1024 * 1024) {
      throw new Error('Data exceeds 5MB limit')
    }

    localStorage.setItem(key, serialized)
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      toast.error('Storage quota exceeded', {
        description: 'Please download results instead',
      })
    }
    throw error
  }
}
```

### Pitfall 2: Mobile-First Breakpoint Confusion

**What goes wrong:** Styles intended for mobile don't apply, or `sm:` styles unexpectedly appear on mobile

**Why it happens:** Tailwind uses mobile-first approach - unprefixed classes apply to all screens, `sm:` applies at 640px+

**How to avoid:** Think "unprefixed = mobile, prefixed = larger screens" not "sm: = small screen"

**Warning signs:**
- Layout looks wrong on mobile but correct on desktop
- Using `sm:` prefix thinking it means "small screens"
- Layout changes unexpectedly when browser width crosses 640px

**Fix:**
```css
/* Wrong - thinks this targets mobile */
<div className="sm:text-center">Text</div>

/* Correct - unprefixed for mobile, override for larger */
<div className="text-center sm:text-left">Text</div>
```

### Pitfall 3: Recharts ResponsiveContainer Display Bug

**What goes wrong:** Chart doesn't render when using `width="100%"` in flex container

**Why it happens:** Known Recharts bug (#2285) where 100% width causes inner element to get display:none

**How to avoid:** Use `width="99%"` or set explicit width with aspect ratio

**Warning signs:**
- Chart renders initially but disappears on resize
- Browser dev tools show chart container has width 0
- Works in some containers but not others

**Fix:**
```typescript
// Wrong - known bug
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data} />
</ResponsiveContainer>

// Correct - use 99% workaround
<ResponsiveContainer width="99%" aspect={3}>
  <BarChart data={data} />
</ResponsiveContainer>
```

### Pitfall 4: Error Boundary Doesn't Catch Async Errors

**What goes wrong:** Error boundary fails to catch errors in event handlers, async code, or server-side rendering

**Why it happens:** React error boundaries only catch errors during rendering, in lifecycle methods, or in constructors

**How to avoid:** Use try-catch for async operations, window error handlers for uncaught errors

**Warning signs:**
- Errors in fetch handlers cause white screen but boundary doesn't trigger
- Promise rejections aren't caught by boundary
- Console errors but UI shows nothing

**Fix:**
```typescript
// Error boundary won't catch this
useEffect(() => {
  fetchData().then(setData) // If this throws, boundary catches
}, [])

// But it WILL catch this
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchData()
      setData(data)
    } catch (error) {
      // Handle error manually
      setError(error)
    }
  }
  loadData()
}, [])
```

### Pitfall 5: Touch Targets Too Small for Mobile

**What goes wrong:** Buttons and links are hard to tap on mobile devices, causing frustration and accessibility issues

**Why it happens:** Desktop-first design doesn't account for finger touch requiring larger targets than mouse clicks

**How to avoid:** Ensure all interactive elements are minimum 44x44px per iOS/WCAG guidelines

**Warning signs:**
- Users complain about "missing" taps on mobile
- Buttons look normal but are hard to activate
- Accessibility audit fails touch target size check

**Fix:**
```css
/* Ensure minimum touch target size */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px; /* Add padding to reach 44px */
}

/* Or use Tailwind utilities */
<Button className="min-h-[44px] px-4 py-3">
  Click me
</Button>
```

### Pitfall 6: Skeleton Screens Don't Match Actual Layout

**What goes wrong:** Skeleton loading state causes layout shift when real content loads

**Why it happens:** Skeleton dimensions don't match the actual content's dimensions

**How to avoid:** Match skeleton height, width, and spacing to actual content structure

**Warning signs:**
- Content "jumps" when it finishes loading
- Skeleton and final content have different heights
- Progress bar or scrollbar appears/disappears

**Fix:**
```typescript
// Match skeleton dimensions to actual content
<Card>
  <CardHeader>
    {/* Skeleton matches h-6 w-48 of actual title */}
    <Skeleton className="h-6 w-48" />
  </CardHeader>
  <CardContent>
    {/* Match rows to actual table rows */}
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full mb-2 last:mb-0" />
    ))}
  </CardContent>
</Card>
```

## Code Examples

### localStorage with Quota Detection

```typescript
// Source: Research based on QuotaExceededError handling patterns
// web/src/lib/storage-utils.ts

export interface StorageOptions {
  quotaMB?: number
  onError?: (error: Error) => void
}

export function saveToLocalStorage<T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): boolean {
  const { quotaMB = 5, onError } = options

  try {
    const serialized = JSON.stringify(value)
    const size = new Blob([serialized]).size
    const sizeMB = size / (1024 * 1024)

    if (sizeMB > quotaMB) {
      throw new Error(`Data size (${sizeMB.toFixed(2)}MB) exceeds quota (${quotaMB}MB)`)
    }

    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      onError?.(error)
    }
    return false
  }
}

export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return null
  }
}

export function clearLocalStorageKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error clearing ${key} from localStorage:`, error)
  }
}
```

### Enhanced useLocalStorage Hook

```typescript
// Source: Based on existing useLocalStorage pattern
// web/src/hooks/use-local-storage.ts (enhanced)

import { useState, useCallback, useEffect } from 'react'
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorageKey } from '@/lib/storage-utils'
import { toast } from 'sonner'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    return loadFromLocalStorage<T>(key) ?? initialValue
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value

    const success = saveToLocalStorage(key, valueToStore, {
      quotaMB: 5,
      onError: (error) => {
        toast.error('Storage quota exceeded', {
          description: 'Could not save to browser storage. Please download results instead.',
          duration: 30000,
        })
        console.error('localStorage save error:', error)
      }
    })

    if (success) {
      setStoredValue(valueToStore)
    }
  }, [key, storedValue])

  const clearValue = useCallback(() => {
    clearLocalStorageKey(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, clearValue] as const
}
```

### Sonner Toast with 30-Second Timeout

```typescript
// Source: Sonner library documentation
// Usage for 30-second error timeout (UX-03)

import { toast } from 'sonner'

function handleProcessingError() {
  toast.error('Processing timed out', {
    description: 'No response received after 30 seconds. Please try again.',
    duration: 30000, // 30 seconds in milliseconds
    action: {
      label: 'Retry',
      onClick: () => retryProcessing(),
    },
  })
}

// Success toast (shorter duration)
function handleSuccess() {
  toast.success('Processing complete', {
    description: 'Results have been saved to browser storage.',
    duration: 4000, // Default for success
  })
}
```

### Responsive Results Table

```typescript
// Source: Tailwind responsive design patterns
// Desktop: full width, Mobile: horizontal scroll

import { ScrollArea } from '@/components/ui/scroll-area'

function ResponsiveResultsTable({ data }: { data: ResultsData[] }) {
  return (
    <div className="w-full">
      {/* Mobile: horizontal scroll, Desktop: normal */}
      <ScrollArea className="lg:w-auto w-full">
        <div className="min-w-[800px]"> {/* Force width on mobile for scroll */}
          <table className="w-full">
            {/* Table content */}
          </table>
        </div>
      </ScrollArea>
    </div>
  )
}
```

### Touch-Target Compliant Button

```typescript
// Source: iOS HIG and WCAG 2.2 guidelines (44x44px minimum)
// Ensuring all buttons meet accessibility requirements

import { Button } from '@/components/ui/button'

function TouchCompliantButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      className="min-h-[44px] min-w-[44px] px-4 py-3" // Meets 44x44px requirement
      {...props}
    >
      {children}
    </Button>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| **Custom toast implementations** | **Sonner library** | 2023+ | Declarative API, animated, accessible, action buttons |
| **Spinners for all loading states** | **Skeleton screens** | 2024+ | Better perceived performance, layout stability |
| **Desktop-first responsive design** | **Mobile-first Tailwind** | 2021+ | Simpler CSS, better mobile UX by default |
| **try-catch in render** | **Error Boundaries** | React 16 (2018) | Only way to catch rendering errors gracefully |
| **Fixed width containers** | **ResponsiveContainer** | 2022+ | Charts that adapt to container size |
| **Generic error messages** | **Context-aware recovery** | 2024+ | Better UX with specific errors and retry actions |

**Deprecated/outdated:**
- **create-react-app:** Deprecated, use Vite instead (not relevant for this phase but worth noting)
- **CSS-in-JS for responsive:** Tailwind utilities are now preferred for responsive design
- **Custom toast implementations:** Sonner and react-toastify have solved this problem
- **Ignoring localStorage quota:** Modern apps must handle QuotaExceededError gracefully
- **Sub-44px touch targets:** Accessibility standards require minimum 44x44px

## Open Questions

1. **Error boundary placement**
   - **What we know:** Error boundaries should wrap independent sections
   - **What's unclear:** Should we have one top-level boundary or multiple section-specific boundaries?
   - **Recommendation:** Start with top-level boundary for whole app, add section-specific boundaries if needed

2. **localStorage vs IndexedDB for large datasets**
   - **What we know:** localStorage has 5MB limit, current results typically fit
   - **What's unclear:** Should we use IndexedDB for future-proofing if results grow?
   - **Recommendation:** Stay with localStorage for Phase 09, migrate to IndexedDB if quota issues arise

3. **Chart horizontal scroll implementation**
   - **What we know:** Recharts has known issues with horizontal scrolling (Issue #1364)
   - **What's unclear:** Best approach for scrollable charts on mobile?
   - **Recommendation:** Use ScrollArea wrapper with min-width container, accept known Recharts limitations

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Responsive Design Documentation](https://tailwindcss.com/docs/responsive-design) - Mobile-first breakpoints, all utilities work responsively
- [shadcn/ui Skeleton Documentation](https://ui.shadcn.com/docs/components/skeleton) - Installation, usage, examples
- [shadcn/ui Spinner Documentation](https://ui.shadcn.com/docs/components/spinner) - Loading states, button integration
- [shadcn/ui Sonner Documentation](https://ui.shadcn.com/docs/components/sonner) - Toast notifications, duration prop
- [React Error Boundaries (Official)](https://legacy.reactjs.org/docs/error-boundaries.html) - Core API, lifecycle methods

### Secondary (MEDIUM confidence)
- [How to Implement Error Boundaries for Graceful Handling (OneUptime, January 2026)](https://oneuptime.com/blog/post/2026-01-15-react-error-boundaries/view) - 2026 best practices, graceful recovery
- [React Error Boundaries in the Real World (Medium)](https://medium.com/@chandralekha-selvam/react-error-boundaries-in-the-real-world-6aac9d453273) - Real-world patterns, retry buttons
- [Stop Using localStorage Like This in React (Medium, 2025)](https://medium.com/@hardlight/stop-using-localstorage-like-this-in-react-beac6351f5f1) - Anti-patterns, best practices
- [Mastering State Persistence with Local Storage in React (Medium, 2025)](https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c) - Complete persistence patterns
- [Handling localStorage errors (mmazzarolo.com, 2022)](https://mmazzarolo.com/blog/2022-06-25-local-storage-status/) - QuotaExceededError handling
- [Recharts Chart Size Documentation](https://recharts.github.io/en-US/guide/sizes/) - ResponsiveContainer, aspect ratio
- [Mobile Accessibility Checker - Touch Targets](https://accessibility.build/tools/mobile-accessibility-checker) - 44x44px validation tool
- [W3C WCAG 2.2: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) - Official accessibility guidelines

### Tertiary (LOW confidence)
- [React Sonner - Toast with Custom Duration (shadcn.io patterns)](https://www.shadcn.io/patterns/sonner-content-3) - Duration prop example
- [emilkowalski/sonner GitHub Repository](https://github.com/emilkowalski/sonner) - Source code, examples
- [How to Use React for State Persistence (UXPin, October 2025)](https://www.uxpin.com/studio/blog/how-to-use-react-for-state-persistence/) - State persistence UX patterns
- [Recharts ResponsiveContainer Flexbox Issue (StackOverflow)](https://stackoverflow.com/questions/50891591/recharts-responsive-container-does-not-resize-correctly-in-flexbox) - 99% width workaround

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - React 19, Tailwind CSS 4.x, Sonner, shadcn/ui are well-documented with official sources
- Architecture: **HIGH** - Error boundaries, localStorage patterns, responsive design are established best practices
- Pitfalls: **HIGH** - All pitfalls verified with official documentation or community consensus
- Code examples: **HIGH** - Based on official documentation and verified patterns

**Research date:** 2026-01-24
**Valid until:** 2026-04-24 (3 months - React 19 and Tailwind 4.x are stable but may have updates)
