# EPUB Tokenizer Counter

## What This Is

A dual-interface tool for analyzing EPUB files to count words and estimate tokens using multiple tokenizer models (GPT-4, Claude, Hugging Face). Users can process EPUBs via CLI or a web UI, receiving token counts with rich visualizations and token budget calculations for API cost planning.

**v2.0 delivered**: Full React + shadcn/ui web interface with real-time SSE processing, data visualizations, token budget calculator, and production-ready UX.

## Core Value

Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.

## Requirements

### Validated

**v1.0 CLI Requirements:**
- ✓ EPUB batch and single-file processing — v1.0
- ✓ EPUB 2.0.1 and 3.0 format support — v1.0
- ✓ Text and metadata extraction from EPUBs — v1.0
- ✓ Word counting with CJK support — v1.0
- ✓ GPT-4 tokenizer (cl100k_base) — v1.0
- ✓ Claude tokenizer — v1.0
- ✓ Hugging Face tokenizer support (custom models) — v1.0
- ✓ JSON output with rich metadata — v1.0
- ✓ Default input/output folders (./epubs/, ./results/) — v1.0
- ✓ Progress indicators (cli-progress MultiBar) — v1.0
- ✓ Error logging (console + errors.log) — v1.0
- ✓ Continue-on-error processing — v1.0
- ✓ Parallel processing (--jobs flag) — v1.0
- ✓ Summary statistics display — v1.0

**v2.0 Web UI Requirements:**
- ✓ React + shadcn/ui frontend with Fastify backend — v2.0
- ✓ Real-time EPUB processing with SSE progress streaming — v2.0
- ✓ Tokenizer selection interface (GPT-4, Claude, HF models) — v2.0
- ✓ File upload (drag-drop zone, file picker, schema validation) — v2.0
- ✓ Data visualizations (bar chart, scatter plot, results table) — v2.0
- ✓ Multi-tokenizer comparison (heatmap, side-by-side chart) — v2.0
- ✓ Token budget calculator with 3 optimization strategies — v2.0
- ✓ Cost estimation for OpenAI, Anthropic, Google — v2.0
- ✓ Session persistence with restore dialog — v2.0
- ✓ Responsive design (desktop/tablet/mobile) — v2.0
- ✓ Error boundaries and loading states — v2.0
- ✓ CSV/JSON export for tables and budget results — v2.0

### Active

None - all requirements shipped in v1.0 and v2.0.

### Out of Scope

- DRM handling — Legal complexity, tool skips DRMed EPUBs with warning
- Text file export — Users want counts, not extracted text
- EPUB modification — Tool is read-only analyzer
- Other document formats (PDF, DOCX, etc.) — EPUB only
- Real-time watch mode — Manual execution only
- User authentication — localhost-only access for v2.0
- Streaming/chunked tokenization — Deferred to future milestones
- Per-chapter token breakdown — Deferred to future milestones
- Tokenizer caching — Deferred to future milestones

## Context

**Current State (v2.0 Shipped):**
- Tech stack: TypeScript (Node.js backend, React frontend)
- ~23,500 lines of code (159 files created/modified for v2.0)
- Dependencies: React, Vite, shadcn/ui, Fastify, Recharts, TanStack Table, @gxl/epub-parser, js-tiktoken, @anthropic-ai/tokenizer, @huggingface/transformers
- Development time: ~8 hours for v2.0 (3 days from v1.0 to v2.0)

**Tokenization context:** Different LLM providers use different tokenizers. GPT-4 uses cl100k_base, Claude uses its own tokenizer. Token count affects API costs and context window limits. Users need accurate counts to estimate processing costs.

**EPUB format:** EPUB is a ZIP-based format containing HTML/XHTML content. Text extraction requires parsing the EPUB structure and extracting readable text from content documents.

**User workflow:** User has a collection of EPUBs (books, documents) and wants to know how many tokens they would consume if processed by various LLMs before committing to API usage. With v2.0, users can now process EPUBs from a web UI with real-time progress, view rich visualizations, and calculate token budgets for cost planning.

**Known Issues / Tech Debt:**
- Optional: Add loading state to FileDropzone during large file validation
- Optional: Add confirmation dialog to NewSessionButton
- Optional: Add initial load indicator to useLocalStorage hook
- Backend POST /api/cancel/:jobId endpoint may not exist (frontend handles gracefully)
- Chart library testing with 1000+ EPUB dataset not yet done

## Constraints

- **Language**: TypeScript with Node.js runtime (backend) and React (frontend)
- **EPUB parsing**: Must handle standard EPUB 2.0 and 3.0 formats via @gxl/epub-parser
- **Error handling**: Tool must not crash on single EPUB failure — process all valid files
- **Output**: JSON results.json with one entry per EPUB (CLI), in-memory state (web UI)
- **Memory**: --max-mb flag defaults to 500MB for large EPUB handling (CLI), browser memory limits (web UI)
- **Access**: localhost-only for v2.0 web UI (no authentication)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TypeScript over Rust | Easier Hugging Face integration, npm ecosystem, sufficient performance | ✓ Good - fast enough for batch processing |
| Single JSON output file | Simpler aggregation, easier to read as single document | ✓ Good - works well for batch results |
| GPT-4 + Claude presets | Most common LLM providers, covers 80%+ of use cases | ✓ Good - users satisfied with presets |
| Rich metadata output | Users need context for each result (when processed, which file) | ✓ Good - essential for tracking |
| Continue-on-error behavior | Large EPUB collections shouldn't fail completely due to one bad file | ✓ Good - prevents batch failures |
| cli-progress for progress bars | Standard Node.js choice, supports multi-bar display | ✓ Good - clear visual feedback (CLI) |
| p-limit for parallel processing | Simple API, respects CPU limits, prevents overwhelming system | ✓ Good - configurable via --jobs (CLI) |
| Factory pattern for tokenizers | Easy to extend with new tokenizer types | ✓ Good - Hugging Face support was simple |
| count: -1 for failed tokenizers | Distinguishes errors from zero-token results | ✓ Good - clear error signaling |
| Claude 3+ inaccuracy warning | @anthropic-ai/tokenizer is for Claude 2, not 3+ | ✓ Good - manages user expectations |
| React + shadcn/ui frontend | Modern stack with excellent TypeScript support and component library | ✓ Good - rapid development with professional UI |
| Fastify backend | Better TypeScript support and performance than Express | ✓ Good - fast API with type safety |
| SSE instead of WebSockets | Simpler for unidirectional progress streaming | ✓ Good - less complexity |
| npm workspaces instead of Turborepo | Simpler for 3-package repo | ✓ Good - sufficient for project scale |
| In-memory job queue | No Redis needed for localhost-only app | ✓ Good - simpler architecture |
| TanStack Table over AG Grid | Headless table allows full UI control | ✓ Good - custom UI without enterprise complexity |
| Recharts for charts | Built-in trend line support, good React integration | ✓ Good - sufficient visualizations |
| Knapsack algorithms for budget | O(n log n) greedy algorithms are fast and effective | ✓ Good - users get optimal results quickly |

## Next Milestone Goals

**Current Status:** v2.0 Web UI complete

**Future milestone ideas (not yet prioritized):**
- Drag-and-drop EPUB upload (bypass server filesystem)
- Per-chapter token breakdown
- Tokenizer caching for repeated runs
- Server-side folder browser with directory tree
- User authentication for multi-user access
- Cloud storage integration
- Database persistence
- Docker/containerization

---
*Last updated: 2026-01-24 after v2.0 milestone*
