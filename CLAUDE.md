# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EPUB Tokenizer Counter - A dual-interface tool for counting words and estimating tokens in EPUB files using various LLM tokenizers. The project is a monorepo with three workspaces: shared types/packages, a CLI tool (legacy), a Fastify backend server, and a React web UI.

**v2.0 delivered**: Full React + shadcn/ui web interface with real-time SSE processing, data visualizations, token budget calculator, and production-ready UX.

## Build & Run Commands

```bash
# Build all packages
npm run build        # Build shared, web, server, and compile TypeScript (CLI)
npm run build:shared # Build shared package only
npm run build:web    # Build web UI only
npm run build:server # Build server only

# Development
npm run dev          # Start both server (3001) and web UI (5173) concurrently
npm run dev:server   # Start Fastify backend only
npm run dev:web      # Start Vite dev server only

# CLI (legacy)
npm start            # Run compiled CLI
npx tsx src/cli/index.ts [options]  # Run CLI directly with TypeScript

# Tests
npx tsx src/cli/__tests__/list-models.test.ts
npx tsx src/tokenizers/__tests__/hf-models.test.ts
```

## Monorepo Structure

```
epub-tokenizer-count/
├── packages/shared/    # Shared types and utilities
│   └── src/
│       ├── index.ts   # Package exports
│       └── types.ts   # Shared TypeScript types
├── server/            # Fastify backend (port 3001)
│   └── src/
│       ├── server.ts  # Fastify app entry point
│       ├── routes/    # API endpoints (process, job-status, sse, list-models)
│       └── lib/       # Job queue, path-validator, schema-validator
├── web/               # React + Vite frontend (port 5173)
│   └── src/
│       ├── main.tsx   # React entry
│       ├── App.tsx    # Main app component
│       └── components/
│           ├── file-upload/    # FileDropzone, FileChip, FolderInput
│           ├── processing/     # ProcessButton, ProcessingProgress
│           ├── progress/       # CompletionSummary
│           ├── tokenizer/      # TokenizerSelector, HFModelCombobox
│           ├── visualization/ # BarChart, ScatterChart, ComparisonHeatmap
│           ├── budget/         # BudgetCalculator, CostEstimationCards
│           ├── persistence/    # RestoreDialog, NewSessionButton
│           └── ui/             # shadcn/ui components
├── src/               # Legacy CLI code (compiled to dist/)
│   ├── cli/           # Commander-based CLI entry
│   ├── epub/          # EPUB parsing, text extraction, metadata
│   ├── tokenizers/    # GPT-4, Claude, Hugging Face tokenizers
│   ├── file-discovery/ # EPUB file scanner
│   ├── errors/        # Error handling and logging
│   ├── parallel/      # Concurrent processing via p-limit
│   └── output/        # JSON, Markdown, Table, Summary generators
└── dist/              # Compiled TypeScript output for CLI
```

## Architecture

### Pipeline Pattern (CLI)

Data flows through distinct stages: file discovery → EPUB parsing → text extraction → tokenization → output generation.

### Client-Server Pattern (Web UI)

- **Frontend**: React SPA with Vite, shadcn/ui components, Recharts visualizations
- **Backend**: Fastify REST API with SSE streaming for real-time progress
- **Communication**: HTTP POST for job submission, SSE for progress updates, GET for status/results

### Core Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| **Shared Types** | `packages/shared/src/types.ts` | Shared Result, EpubMetadata types |
| **Server** | `server/src/server.ts` | Fastify app with CORS, SSE support |
| **Job Queue** | `server/src/lib/job-queue.ts` | In-memory job management with Map |
| **Process Route** | `server/src/routes/process.ts` | EPUB processing endpoint |
| **SSE Route** | `server/src/routes/sse.ts` | Server-Sent Events for progress |
| **List Models** | `server/src/routes/list-models.ts` | HF model discovery endpoint |
| **React App** | `web/src/App.tsx` | Main app with tab layout |
| **File Dropzone** | `web/src/components/file-upload/FileDropzone.tsx` | Drag-drop file upload |
| **Tokenizer Selector** | `web/src/components/tokenizer/TokenizerSelector.tsx` | Model selection UI |
| **Process Button** | `web/src/components/processing/ProcessButton.tsx` | Start processing button |
| **Processing Progress** | `web/src/components/progress/ProcessingProgress.tsx` | SSE-based progress display |
| **Bar Chart** | `web/src/components/visualization/BarChart.tsx` | Recharts bar visualization |
| **Scatter Chart** | `web/src/components/visualization/ScatterChart.tsx` | Correlation plot |
| **Comparison Heatmap** | `web/src/components/visualization/ComparisonHeatmap.tsx` | Multi-tokenizer comparison |
| **Budget Calculator** | `web/src/components/budget/BudgetCalculator.tsx` | Token budget optimization |
| **CLI Entry** | `src/cli/index.ts` | Commander-based CLI, orchestrates pipeline |
| **EPUB Parser** | `src/epub/parser.ts` | Wrapper around `@gxl/epub-parser` |
| **Text Extraction** | `src/epub/text.ts` | Uses `toMarkdown()` to avoid HTML contamination |
| **Metadata** | `src/epub/metadata.ts` | Extracts title, author, language from OPF files |
| **Tokenizer Registry** | `src/tokenizers/index.ts` | Factory for creating tokenizers by name |
| **GPT-4** | `src/tokenizers/gpt.ts` | Uses `js-tiktoken` (synchronous) |
| **Claude** | `src/tokenizers/claude.ts` | Uses `@anthropic-ai/tokenizer` (synchronous) |
| **Hugging Face** | `src/tokenizers/huggingface.ts` | Uses `@huggingface/transformers` (async) |
| **Error Handler** | `src/errors/handler.ts` | Central processing with continue-on-error |
| **Output** | `src/output/` | JSON (schema v1.0), Markdown, Table, Summary statistics |

### Key Design Patterns

- **Monorepo**: npm workspaces for shared types between server and web
- **Error Isolation**: Single EPUB failures don't stop batch processing (ERROR/WARN levels continue, FATAL exits)
- **Lazy Initialization**: Tokenizers loaded on first use
- **Synchronous vs Async**: GPT-4 and Claude tokenizers are synchronous; Hugging Face is async
- **Parallel Processing**: CPU-aware job defaults (`CPU count - 1`), configurable via `--jobs` (CLI)
- **SSE Streaming**: Real-time progress updates from server to web UI
- **In-Memory Job Queue**: No Redis needed for localhost-only app
- **Session Persistence**: Local storage for automatic save/restore

### Output Format

JSON output includes `schema_version: "1.0"` field for compatibility tracking.

## Tokenizer Specification

- `gpt4` - GPT-4 (cl100k_base via js-tiktoken)
- `claude` - Claude (@anthropic-ai/tokenizer)
- `hf:<model>` - Hugging Face model (e.g., `hf:bert-base-uncased`)

**Popular Hugging Face Models:**
- `hf:bert-base-uncased` - English text
- `hf:Xenova/bert-base-uncased` - BERT (faster ONNX)
- `hf:gpt2` - English generation
- `hf:meta-llama/Llama-2-7b` - General purpose
- `hf:meta-llama/Meta-Llama-3-8B` - General purpose (newer)
- `hf:mistralai/Mistral-7B-v0.1` - Multilingual

Browse models: https://huggingface.co/models?library=transformers.js

## Web UI Features

### Components by Feature Area

**File Upload:**
- `FileDropzone.tsx` - Drag-drop zone with file validation
- `FileChip.tsx` - Display selected files with remove option
- `FolderInput.tsx` - Input for specifying server-side folder path

**Tokenizer Selection:**
- `TokenizerSelector.tsx` - Toggle group for preset tokenizers
- `HFModelCombobox.tsx` - Searchable dropdown for HF models
- `ModelInfoCard.tsx` - Display selected model information

**Processing:**
- `ProcessButton.tsx` - Start processing with loading state
- `ProcessingProgress.tsx` - SSE-based progress with file-by-file updates
- `CompletionSummary.tsx` - Summary stats after processing completes

**Visualizations:**
- `BarChart.tsx` - Word/token counts per EPUB
- `ScatterChart.tsx` - Word count vs. token count correlation
- `ComparisonBarChart.tsx` - Side-by-side multi-tokenizer comparison
- `ComparisonHeatmap.tsx` - Heatmap visualization for token ratios
- `ResultsTable.tsx` - Sortable table with all results

**Token Budget:**
- `BudgetCalculator.tsx` - Main calculator with strategy selection
- `BudgetProgressBar.tsx` - Visual progress bar for budget usage
- `CostEstimationCards.tsx` - Cost estimates for OpenAI, Anthropic, Google
- `SelectedBooksTable.tsx` - Table showing selected books
- `ExportButtons.tsx` - CSV/JSON export functionality

**Persistence:**
- `RestoreDialog.tsx` - Dialog to restore previous session
- `NewSessionButton.tsx` - Start new session (clears storage)

**UI Components (shadcn/ui):**
- `badge.tsx`, `button.tsx`, `card.tsx`, `command.tsx`, `dialog.tsx`, `hover-card.tsx`, `input.tsx`, `popover.tsx`, `progress.tsx`, `sonner.tsx`, `slider.tsx`, `tabs.tsx`, `toggle.tsx`, `skeleton.tsx`, `spinner.tsx`

### Token Budget Calculator

Three optimization strategies:
1. **Greedy (Maximize Count)**: O(n log n) - Maximize number of books within budget
2. **Best Value**: O(n log n) - Maximize total word count within budget
3. **Balanced**: O(n log n) - Balance between count and word count

Cost estimation supports:
- OpenAI (GPT-4, GPT-4 Turbo)
- Anthropic (Claude Opus, Sonnet, Haiku)
- Google (Gemini Pro)

## Server API

### Endpoints

- `POST /api/process` - Submit EPUB processing job
- `GET /api/job-status/:jobId` - Get job status and results
- `GET /api/sse/:jobId` - SSE stream for real-time progress
- `GET /api/list-models` - List available Hugging Face models
- `POST /api/upload-results/:jobId` - Upload results to server state

### SSE Progress Events

```typescript
type ProgressEvent =
  | { type: 'progress'; file_index: number; total_files: number; filename: string }
  | { type: 'file_complete'; result: Result }
  | { type: 'file_error'; filename: string; error: string }
  | { type: 'complete'; results: Result[]; summary: SummaryStats }
  | { type: 'error'; error: string }
```

## Planning Structure

The project uses GSD methodology with detailed phase documentation in `.planning/`:

- `.planning/PROJECT.md` - Project goals, requirements, constraints
- `.planning/research/` - ARCHITECTURE.md, STACK.md, FEATURES.md, PITFALLS.md
- `.planning/phases/` - Individual phase plans with context and research

## Important Constraints

- **Tokenizers**: Must use industry-standard libraries (js-tiktoken, @anthropic-ai/tokenizer, @huggingface/transformers)
- **Error handling**: Tool must not crash on single EPUB failure
- **Output**: One JSON + Markdown file per run (CLI), in-memory state (web UI)
- **EPUB format**: Must handle standard EPUB 2.0 and 3.0
- **TypeScript**: ES2022 target with NodeNext module resolution
- **Web UI**: localhost-only access for v2.0 (no authentication)
- **Memory**: --max-mb flag defaults to 500MB for large EPUB handling (CLI), browser memory limits (web UI)

## Known Issues / Tech Debt

- Optional: Add loading state to FileDropzone during large file validation
- Optional: Add confirmation dialog to NewSessionButton
- Optional: Add initial load indicator to useLocalStorage hook
- Backend POST /api/cancel/:jobId endpoint may not exist (frontend handles gracefully)
- Chart library testing with 1000+ EPUB dataset not yet done

## Dependencies

**Runtime:**
- @anthropic-ai/tokenizer - Claude tokenization
- @gxl/epub-parser - EPUB format parsing
- @huggingface/transformers - HF model tokenization
- @microsoft/fetch-event-source - SSE client for web UI
- @tanstack/react-table - Headless table for results
- cli-progress - Progress bars (CLI)
- cli-table3 - Table output (CLI)
- commander - CLI framework
- js-tiktoken - GPT-4 tokenization
- lucide-react - Icon library
- p-limit - Parallel processing limiting
- sonner - Toast notifications
- tailwind-merge - Tailwind class merging

**Dev:**
- typescript - TypeScript compiler
- tailwindcss - CSS framework
- vite - Web UI dev server and bundler
- fastify - Backend server framework
- concurrently - Run multiple dev servers
