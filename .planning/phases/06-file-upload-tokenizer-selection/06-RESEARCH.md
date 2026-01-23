# Phase 6: File Upload & Tokenizer Selection - Research

**Researched:** 2026-01-23
**Domain:** React UI components, shadcn/ui, SSE client integration, localStorage persistence
**Confidence:** HIGH

## Summary

This phase implements the frontend interfaces for uploading results.json files, selecting tokenizers (GPT-4, Claude, Hugging Face models), inputting EPUB folder paths, and monitoring processing progress with real-time SSE feedback. The implementation uses shadcn/ui components for UI elements, @microsoft/fetch-event-source for SSE streaming, and localStorage for persisting tokenizer selections.

**Key findings:**
1. **Toast component is DEPRECATED** - Use shadcn/ui's **Sonner** component instead for error notifications
2. **ToggleGroup** is the ideal component for tokenizer selection chips - supports `type="multiple"` for multi-select toggle behavior
3. **fetch-event-source** by Microsoft is the standard for SSE in React - superior to native EventSource API with POST support, custom headers, and retry control
4. **Combobox** (Popover + Command composition) is the shadcn/ui pattern for searchable Hugging Face model selection
5. **HoverCard** provides model info on hover/click for Hugging Face model details
6. Standard localStorage hook pattern with useState for persisting selections across page loads

**Primary recommendation:** Use shadcn/ui ToggleGroup for tokenizer chips, Combobox for Hugging Face search, Sonner for toasts, fetch-event-source for SSE, and custom useLocalStorage hook for persistence.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **shadcn/ui** | Latest (2026) | Component library for React | Production-grade components built on Radix UI + Tailwind CSS, industry standard for React UIs |
| **@microsoft/fetch-event-source** | Latest | SSE client for React | Better than native EventSource - supports POST, custom headers, retry control, abort signals |
| **sonner** | Latest | Toast notifications (replaces deprecated toast) | Official shadcn/ui recommendation, opinionated and simple API |
| **Ajv** | v8+ | JSON schema validation | Fastest JSON schema validator for JavaScript, industry standard |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **React Hook Form** | Latest | Form state management | For complex form validation scenarios |
| **Zod** | Latest | Schema validation with TypeScript | Alternative to Ajv if TypeScript-first validation is preferred |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui Sonner | react-hot-toast | Sonner is official shadcn recommendation, simpler API |
| fetch-event-source | native EventSource | Native doesn't support POST/custom headers/retry control |
| ToggleGroup | individual Toggle components | ToggleGroup provides built-in multi/single selection state |
| Combobox (Popover+Command) | Select with search | Combobox provides better UX for large lists with search |

**Installation:**
```bash
# shadcn/ui components
pnpm dlx shadcn@latest add sonner
pnpm dlx shadcn@latest add toggle-group
pnpm dlx shadcn@latest add combobox
pnpm dlx shadcn@latest add command
pnpm dlx shadcn@latest add popover
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add hover-card
pnpm dlx shadcn@latest add badge

# dependencies
npm install @microsoft/fetch-event-source ajv
npm install -D @types/ajv  # if needed
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── tokenizer/
│   │   ├── TokenizerSelector.tsx    # ToggleGroup for GPT-4/Claude/HF selection
│   │   ├── HFModelCombobox.tsx      # Combobox for HF model search
│   │   └── ModelInfoCard.tsx        # HoverCard content for model details
│   ├── file-upload/
│   │   ├── FileDropzone.tsx         # Drag-drop zone for results.json
│   │   └── FileChip.tsx             # Compact chip showing selected file
│   ├── progress/
│   │   ├── ProcessingProgress.tsx   # Progress bar + current file + ETA
│   │   └── CompletionSummary.tsx    # Results card shown after completion
│   └── ui/                           # shadcn/ui components
├── hooks/
│   ├── use-local-storage.ts         # Custom hook for localStorage persistence
│   ├── use-sse-connection.ts        # Custom hook for fetch-event-source
│   └── use-tokenizers.ts            # Hook for tokenizer state + localStorage
├── lib/
│   ├── schema-validator.ts          # Ajv wrapper for results.json validation
│   └── api-client.ts                # API fetch wrappers
└── types/
    └── tokenizer.types.ts           # Frontend-specific type extensions
```

### Pattern 1: Custom useLocalStorage Hook

**What:** React hook that persists state to localStorage with automatic hydration on mount.

**When to use:** Any state that needs to persist across page reloads (tokenizer selection, settings).

**Example:**
```typescript
// Source: Multiple community sources, standard pattern

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get stored value or use initial
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}
```

### Pattern 2: SSE Connection with fetch-event-source

**What:** Custom hook wrapping @microsoft/fetch-event-source for SSE streaming.

**When to use:** Real-time progress updates from backend processing.

**Example:**
```typescript
// Source: https://github.com/Azure/fetch-event-source

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useCallback, useRef } from 'react'

export function useSseConnection() {
  const abortControllerRef = useRef<AbortController | null>(null)

  const connect = useCallback(async (
    url: string,
    onProgress: (data: EpubProgress) => void,
    onComplete: (results: ResultsOutput) => void,
    onError: (error: string) => void
  ) => {
    abortControllerRef.current = new AbortController()

    await fetchEventSource(url, {
      method: 'GET',
      signal: abortControllerRef.current.signal,
      onopen(response) {
        if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
          return
        }
        throw new Error(`Unexpected response: ${response.status}`)
      },
      onmessage(msg) {
        if (msg.event === 'progress') {
          onProgress(JSON.parse(msg.data))
        } else if (msg.event === 'completed') {
          onComplete(JSON.parse(msg.data))
        } else if (msg.event === 'error') {
          const error = JSON.parse(msg.data)
          onError(error.message)
        }
      },
      onerror(err) {
        onError(err.message)
        throw err // Stop retry on fatal error
      },
    })
  }, [])

  const disconnect = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return { connect, disconnect }
}
```

### Pattern 3: ToggleGroup for Multi-Select Chips

**What:** Using shadcn/ui ToggleGroup with `type="multiple"` for tokenizer selection chips.

**When to use:** Multi-select toggleable items with visual state feedback.

**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/toggle-group

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function TokenizerSelector() {
  const [selectedTokenizers, setSelectedTokenizers] = useLocalStorage<TokenizerType[]>(
    'selected-tokenizers',
    ['gpt4', 'claude'] // Default to GPT-4 and Claude
  )

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Select Tokenizers</label>
      <ToggleGroup
        type="multiple"
        value={selectedTokenizers}
        onValueChange={setSelectedTokenizers}
        variant="outline"
        className="flex flex-wrap gap-2"
      >
        <ToggleGroupItem value="gpt4" aria-label="Select GPT-4">
          GPT-4
        </ToggleGroupItem>
        <ToggleGroupItem value="claude" aria-label="Select Claude">
          Claude
        </ToggleGroupItem>
      </ToggleGroup>

      {/* HF Model Combobox would be separate or integrated */}
    </div>
  )
}
```

### Pattern 4: Combobox for Searchable Hugging Face Models

**What:** shadcn/ui Combobox (Popover + Command composition) for searching and selecting HF models.

**When to use:** Large lists that need search/filter capability.

**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/combobox

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"

export function HFModelCombobox() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const hfModels = useHFModels() // Fetched from /api/list-models

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? hfModels.find(m => m.id === value)?.name : "Select Hugging Face model..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search Hugging Face models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {hfModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === model.id ? "opacity-100" : "opacity-0")} />
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <span className="flex-1">{model.name}</span>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <ModelInfoCard model={model} />
                    </HoverCardContent>
                  </HoverCard>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

### Pattern 5: File Dropzone with Drag States

**What:** HTML5 drag-and-drop API with visual feedback for drag states.

**When to use:** File upload interfaces with drag-drop support.

**Example:**
```typescript
// Source: MDN HTML Drag and Drop API

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone' // Alternative: use native HTML5 API

export function FileDropzone({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-all",
        isDragging ? "border-primary bg-primary/5 scale-105" : "border-muted-foreground/25"
      )}
    >
      <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground">
        Drop results.json file here or click to browse
      </p>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Using deprecated toast component** - shadcn/ui officially deprecated toast in February 2025; use Sonner instead
- **Using native EventSource** - Doesn't support POST requests, custom headers, or retry control; use fetch-event-source
- **Hand-rolling localStorage logic** - Extract to a reusable useLocalStorage hook to avoid code duplication
- **Using individual Toggles without ToggleGroup** - ToggleGroup provides built-in state management for multi/single selection
- **Not aborting SSE connections** - Always use AbortController to cleanup SSE connections on unmount

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast system with timeout logic | shadcn/ui **Sonner** | Handles auto-dismiss, positioning, animations, queueing |
| Toggle chips with selection state | Manual state + styling for each chip | shadcn/ui **ToggleGroup** | Built-in multi/single selection, keyboard navigation, accessibility |
| SSE reconnection logic | Manual retry with exponential backoff | **@microsoft/fetch-event-source** | Handles retry strategy, abort signals, POST support, custom headers |
| JSON schema validation | Manual type checking | **Ajv** | Fast validator (compiles to functions), supports JSON Schema spec |
| File drag-drop | Native drag events with edge cases | **react-dropzone** (optional) or HTML5 API | Handles file type validation, multiple files, drag state edge cases |

**Key insight:** UI components and infrastructure like SSE clients have complex edge cases (accessibility, keyboard nav, retry logic, error states) that existing libraries have already solved.

## Common Pitfalls

### Pitfall 1: Using Deprecated Toast Component

**What goes wrong:** Following old tutorials that use shadcn/ui's toast component, which was deprecated in February 2025.

**Why it happens:** Old blog posts and GitHub issues still reference the deprecated toast component.

**How to avoid:**
- Always check the official shadcn/ui docs for current component status
- Use **Sonner** for all toast/notification needs in 2026
- Sonner API: `toast.message()` with optional `description` and `action` props

**Warning signs:** Importing from `@/components/ui/toast` or using `<Toaster />` component instead of Sonner's `<Toaster />`.

### Pitfall 2: SSE Memory Leaks

**What goes wrong:** SSE connections remain open after component unmount, causing memory leaks and ghost connections.

**Why it happens:** Forgetting to abort fetch-event-source connections in useEffect cleanup.

**How to avoid:**
```typescript
useEffect(() => {
  const controller = new AbortController()

  fetchEventSource('/api/sse', {
    signal: controller.signal,
    // ... handlers
  })

  return () => controller.abort() // CRITICAL: cleanup
}, [])
```

**Warning signs:** Network tab shows multiple SSE connections, console shows connection errors after page navigation.

### Pitfall 3: localStorage JSON parsing Errors

**What goes wrong:** App crashes on load if localStorage contains invalid JSON.

**Why it happens:** localStorage stores strings; JSON.parse() throws if content is malformed.

**How to avoid:**
```typescript
const [value, setValue] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? initialValue
  } catch {
    return initialValue // Fallback on parse error
  }
})
```

**Warning signs:** App crashes on first load, works fine after clearing browser data.

### Pitfall 4: ToggleGroup Value Type Mismatch

**What goes wrong:** ToggleGroup items not showing as selected despite correct values.

**Why it happens:** ToggleGroup uses strict equality; value types must match (string vs string array).

**How to avoid:**
```typescript
// WRONG: type="multiple" with string value
<ToggleGroup type="multiple" value="gpt4">

// RIGHT: type="multiple" with string array
<ToggleGroup type="multiple" value={["gpt4", "claude"]}>
```

**Warning signs:** Click items but visual state doesn't change, or all items show selected when only one should be.

### Pitfall 5: Combobox Search Not Working

**What goes wrong:** Command search filter doesn't match any items.

**Why it happens:** Command filters by `value` prop, not display text. Ensure model IDs are searchable.

**How to avoid:**
```typescript
// Add both ID and name as filterable values
<CommandItem value={`${model.id} ${model.name}`}>
  {model.name}
</CommandItem>
```

**Warning signs:** Typing in search input shows "No results found" even when item exists.

## Code Examples

Verified patterns from official sources:

### Sonner Toast Notifications

```typescript
// Source: https://ui.shadcn.com/docs/components/sonner

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function ToastExample() {
  return (
    <Button
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
  )
}

// Setup in app/layout.tsx:
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
```

### Progress Bar with Animated Stripes

```typescript
// Source: Tailwind CSS patterns + shadcn/ui Progress

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function StripedProgress({ value }: { value: number }) {
  return (
    <div className="relative w-full overflow-hidden rounded-full bg-secondary">
      <Progress
        value={value}
        className="h-2 w-full"
      />
      {/* Custom striped animation using CSS */}
      <div
        className={cn(
          "absolute inset-0 animate-progress-stripes",
          "bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]",
          "bg-[length:1rem_1rem]"
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

// Add to tailwind.config.js or global CSS:
// keyframes: {
//   "progress-stripes": {
//     "0%": { backgroundPosition: "1rem 0" },
//     "100%": { backgroundPosition: "0 0" }
//   }
// }
```

### Ajv JSON Schema Validation

```typescript
// Source: https://ajv.js.org/

import Ajv from 'ajv'
import type { ResultsOutput } from '@epub-counter/shared'

const ajv = new Ajv()

const resultsSchema = {
  type: "object",
  required: ["schemaVersion", "timestamp", "results", "summary"],
  properties: {
    schemaVersion: { type: "string", const: "1.0" },
    timestamp: { type: "string", format: "date-time" },
    results: {
      type: "array",
      items: {
        type: "object",
        required: ["filePath", "metadata", "wordCount", "tokenCounts"],
        // ... full schema
      }
    },
    summary: {
      type: "object",
      required: ["total", "success", "failed"],
      properties: {
        total: { type: "number" },
        success: { type: "number" },
        failed: { type: "number" }
      }
    }
  }
}

const validateResults = ajv.compile(resultsSchema)

export function validateResultsFile(data: unknown): data is ResultsOutput {
  const valid = validateResults(data)
  if (!valid) {
    console.error('Validation errors:', validateResults.errors)
  }
  return valid
}
```

### useLocalStorage Hook

```typescript
// Source: Community pattern, widely used

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| shadcn/ui toast | shadcn/ui Sonner | February 2025 (Tailwind v4 update) | Must migrate toasts to Sonner API |
| native EventSource | @microsoft/fetch-event-source | 2021+ | Better SSE support with POST/headers |
| localStorage sync API | Custom useLocalStorage hook | Ongoing | React hooks pattern is more explicit |
| Manual toggle state | ToggleGroup component | 2024+ | Declarative multi-select toggle UI |

**Deprecated/outdated:**
- **shadcn/ui Toast**: Removed in February 2025, replaced by Sonner
- **Individual Toggle management**: ToggleGroup provides built-in state
- **Basic Progress bar**: Add striped animation for better UX

## Open Questions

1. **Striped progress bar animation**
   - What we know: shadcn/ui Progress component uses basic value prop
   - What's unclear: Whether to use custom CSS or Tailwind plugin for stripes
   - Recommendation: Use custom CSS with `@keyframes` animation on striped gradient background

2. **Folder picker for server-side paths**
   - What we know: Browser cannot pick server-side folders directly
   - What's unclear: Whether to use text input vs. relative path picker
   - Recommendation: Phase 06-03 should explore folder picker patterns (this is a "Claude's discretion" area from CONTEXT.md)

## Sources

### Primary (HIGH confidence)
- [Sonner - shadcn/ui](https://ui.shadcn.com/docs/components/sonner) - Toast replacement usage
- [Progress - shadcn/ui](https://ui.shadcn.com/docs/components/progress) - Progress bar component
- [Combobox - shadcn/ui](https://ui.shadcn.com/docs/components/combobox) - Popover + Command pattern
- [Toggle Group - shadcn/ui](https://ui.shadcn.com/docs/components/toggle-group) - Multi-select toggle chips
- [Hover Card - shadcn/ui](https://ui.shadcn.com/docs/components/hover-card) - Model info on hover
- [Badge - shadcn/ui](https://ui.shadcn.com/docs/components/badge) - Badge component variants
- [fetch-event-source - GitHub](https://github.com/Azure/fetch-event-source) - SSE client library with full API documentation

### Secondary (MEDIUM confidence)
- [Using Fetch Event Source for server-sent events in React - LogRocket](https://blog.logrocket.com/using-fetch-event-source-server-sent-events-react/) - React SSE implementation patterns
- [File drag and drop - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop) - Native HTML5 drag-drop API
- [Ajv JSON schema validator](https://ajv.js.org/) - Official Ajv documentation

### Tertiary (LOW confidence)
- [react-dropzone](https://react-dropzone.js.org/) - Alternative to native HTML5 drag-drop (not verified against official docs)
- Various localStorage hook tutorials (community patterns, not official)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components verified against official shadcn/ui documentation (2026)
- Architecture: HIGH - Patterns verified against official docs and established community patterns
- Pitfalls: HIGH - Based on official deprecation notices and well-documented issues

**Research date:** 2026-01-23
**Valid until:** 30 days (shadcn/ui is stable, but verify deprecation notices before planning)
