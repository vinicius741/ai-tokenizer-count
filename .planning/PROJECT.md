# EPUB Tokenizer Counter

## What This Is

A dual-interface tool for analyzing EPUB files to count words and estimate tokens using multiple tokenizer models (GPT-4, Claude, Hugging Face). Users can process EPUBs via CLI or a web UI, receiving token counts with rich visualizations and token budget calculations for API cost planning.

## Core Value

Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.

## Requirements

### Validated

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

### Active

**Current Milestone: v2.0 Web UI**

**Goal:** Add a React + shadcn/ui web interface for EPUB processing, data visualization, and token equivalence calculations.

**Target features:**
- Separate frontend/backend architecture (React + shadcn/ui frontend, Node.js server backend)
- Both execution modes: Run EPUBs from UI OR upload existing results.json
- Server-side EPUB folder selection for processing
- Server file system for results data storage
- Data visualizations: Bar charts (token counts across books), Scatter plots (word vs token counts)
- Token budget calculator: "I have X tokens → which books fit?" equivalence display
- No authentication (localhost-only access)
- CLI tokenizer selection interface in UI

### Out of Scope

- DRM handling — Legal complexity, tool skips DRMed EPUBs with warning
- Text file export — Users want counts, not extracted text
- EPUB modification — Tool is read-only analyzer
- Other document formats (PDF, DOCX, etc.) — EPUB only for v1
- Real-time watch mode — Manual execution only
- User authentication — localhost-only access for v2
- Streaming/chunked tokenization — Deferred to v2 (PERF-01)
- Tokenizer caching — Deferred to v2 (PERF-02)
- Cost estimation calculator — Deferred to v2 (ADV-01)
- Per-chapter token breakdown — Deferred to v2 (ADV-02)
- Diff mode for tokenizer comparison — Deferred to v2 (ADV-03)

## Context

**Current State (v1.0 Shipped):**
- Tech stack: TypeScript with Node.js runtime
- ~18,000 lines of code (52 files created/modified)
- Dependencies: @gxl/epub-parser, js-tiktoken, @anthropic-ai/tokenizer, @huggingface/transformers, cli-progress, cli-table3, p-limit
- Single-day development (7 hours from start to ship)

**Tokenization context:** Different LLM providers use different tokenizers. GPT-4 uses cl100k_base, Claude uses its own tokenizer. Token count affects API costs and context window limits. Users need accurate counts to estimate processing costs.

**EPUB format:** EPUB is a ZIP-based format containing HTML/XHTML content. Text extraction requires parsing the EPUB structure and extracting readable text from content documents.

**User workflow:** User has a collection of EPUBs (books, documents) and wants to know how many tokens they would consume if processed by various LLMs before committing to API usage.

**Known Issues / Tech Debt:**
- TODO comment in src/tokenizers/types.ts:107 - unused createTokenizer() function (factory is in index.ts)
- Placeholder comment in src/output/summary.ts:117 - per-file timing not implemented (feature not in v1 scope)

## Constraints

- **Language**: TypeScript with Node.js runtime (changed from initial Rust plan)
- **EPUB parsing**: Must handle standard EPUB 2.0 and 3.0 formats via @gxl/epub-parser
- **Error handling**: Tool must not crash on single EPUB failure — process all valid files
- **Output**: JSON results.json with one entry per EPUB (combined output)
- **Memory**: --max-mb flag defaults to 500MB for large EPUB handling

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TypeScript over Rust | Easier Hugging Face integration, npm ecosystem, sufficient performance | ✓ Good - fast enough for batch processing |
| Single JSON output file | Simpler aggregation, easier to read as single document | ✓ Good - works well for batch results |
| GPT-4 + Claude presets | Most common LLM providers, covers 80%+ of use cases | ✓ Good - users satisfied with presets |
| Rich metadata output | Users need context for each result (when processed, which file) | ✓ Good - essential for tracking |
| Continue-on-error behavior | Large EPUB collections shouldn't fail completely due to one bad file | ✓ Good - prevents batch failures |
| cli-progress for progress bars | Standard Node.js choice, supports multi-bar display | ✓ Good - clear visual feedback |
| p-limit for parallel processing | Simple API, respects CPU limits, prevents overwhelming system | ✓ Good - configurable via --jobs |
| Factory pattern for tokenizers | Easy to extend with new tokenizer types | ✓ Good - Hugging Face support was simple |
| count: -1 for failed tokenizers | Distinguishes errors from zero-token results | ✓ Good - clear error signaling |
| Claude 3+ inaccuracy warning | @anthropic-ai/tokenizer is for Claude 2, not 3+ | ✓ Good - manages user expectations |

## Next Milestone Goals

**Current: v2.0 Web UI** (active)

Building a React + shadcn/ui web interface with:
- Separate frontend/backend architecture
- Data visualizations (bar charts, scatter plots)
- Token budget calculator for cost planning
- Both execution modes (run from UI or upload results)

**Future milestones (not yet prioritized):**
- Streaming/chunked tokenization for large EPUBs
- Tokenizer caching for repeated runs
- Per-chapter token breakdown
- Diff mode (compare tokenizer results)

---
*Last updated: 2026-01-22 after v2.0 milestone initiation*
