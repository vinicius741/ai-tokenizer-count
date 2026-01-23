# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.
**Current focus:** Phase 6: File Upload & Tokenizer Selection

## Current Position

Phase: 6 of 9 (Phase 6: File Upload & Tokenizer Selection)
Plan: 3 of 5 in current phase
Status: In progress
Last activity: 2026-01-23 — Completed Plan 06-03: Processing Controls

Progress: [██████████░] 60% (24/40 total plans complete: 13 from v1.0, 11 from v2.0)

## Milestone v1.0 Summary (Archived)

**Delivered:** EPUB Tokenizer Counter CLI tool

- 3 phases (EPUB Foundation, Tokenization Engine, CLI Polish)
- 13 plans executed
- ~18,000 lines of TypeScript code
- 52 files created/modified
- 31/31 requirements validated

**Archived:**
- milestones/v1-ROADMAP.md (full phase details)
- milestones/v1-REQUIREMENTS.md (all requirements with outcomes)
- milestones/v1-MILESTONE-AUDIT.md (audit report)

## Performance Metrics

**Velocity:**
- Total plans completed: 22 (13 from v1.0 + 9 from v2.0)
- Total execution time: ~10.5 hours (v1.0: ~7.25h, v2.0: ~3.25h)
- Average per plan: ~11 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 (v1.0) | 4 | ~1h | ~15 min |
| 2 (v1.0) | 3 | ~0.5h | ~10 min |
| 3 (v1.0) | 6 | ~5.5h | ~55 min |
| 4 (v2.0) | 4 | ~45 min | ~11 min |
| 5 (v2.0) | 5 | ~1.5h | ~18 min |

*Updated after each plan completion*

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table with outcomes.

**Key technical decisions from v1.0:**
- TypeScript over Rust for easier Hugging Face integration
- Factory pattern for tokenizer extensibility
- Continue-on-error for batch resilience
- cli-progress MultiBar for visual feedback
- p-limit for parallel I/O-bound processing
- Rich JSON output with schema_version

**New decisions for v2.0 (from research and plan execution):**
- React + shadcn/ui frontend with Fastify backend
- Server file system storage (not database)
- No authentication (localhost-only)
- Both execution modes (run from UI or upload results)
- SSE for real-time progress (simpler than WebSockets)
- Single-repo structure with npm workspaces (not Turborepo) for simplicity
- Fastify chosen over Express for better TypeScript support and performance
- CORS with origin: true for development (will restrict in production)
- Server listening on 0.0.0.0:8787 (all interfaces, not just localhost)
- API routes prefixed with /api/ (e.g., /api/health)
- **Dual CJS/ESM builds for shared package** (Node.js and bundler compatibility)
- **npm workspaces with '*' version** for workspace dependencies
- **TypeScript path mapping + Vite alias** pattern for seamless shared imports
- **postinstall hook to build shared package** automatically after npm install
- **Unified build pipeline** (npm run build compiles all packages)
- **Inline HF models list in server** to avoid cross-package TypeScript rootDir issues (05-01)
- **API response wrapper pattern** with { success: true, data: T } for consistent responses (05-01)
- **Dynamic imports for CLI code reuse** to avoid TypeScript rootDir violations when importing from workspace root (05-02)
- **Sequential job processing** (not parallel) for server EPUB processing to avoid system overload (05-02)
- **Allow absolute paths for localhost API** - Path validation blocks `..` and `~` but allows absolute paths for usability (05-03)
- **Workspace root path resolution** - Server runs from `server/` but relative paths resolve from workspace root for user convenience (05-03)
- **Raw SSE with reply.raw.write()** for real-time progress streaming instead of using a plugin (05-04)
- **Progress callback per job** with client disconnect handling that doesn't stop job execution (05-04)
- **Manual schema validation** without external libraries (ajv, zod) - simpler for results.json validation (05-05)
- **1MB body limit for upload-results** prevents large file uploads to the API endpoint (05-05)
- **ToggleGroup for tokenizer chips** - shadcn/ui ToggleGroup provides built-in multi-select state and accessibility (06-01)
- **Sonner for toast notifications** - shadcn/ui officially deprecated toast; Sonner is the replacement (06-01)
- **Separate HF model combobox** - Large HF model list requires searchable dropdown instead of chips (06-01)
- **localStorage for tokenizer persistence** - useLocalStorage hook remembers selections across sessions (06-01)
- **Scale animation (scale-[1.02])** for drag-drop visual feedback on file upload zone (06-02)
- **File chip UI pattern** - expand zone when empty, shrink to compact chip when file loaded (06-02)
- **Frontend schema validation** mirrors backend approach using manual type checking (06-02)
- **Text input for server-side folder paths** - browsers cannot access server file system, so FolderInput uses controlled text input with edit mode (06-03)
- **Conditional button enable pattern** - ProcessButton disabled when either folderPath empty OR selectedTokenizers empty (06-03)
- **Read-only display with edit toggle** - FolderInput shows path read-only, edit button toggles input field with Enter/Save and Escape/Cancel (06-03)
### Pending Todos

None.

### Blockers/Concerns

**Research Flags (from research/SUMMARY.md):**

- ~~**Phase 4**: Monorepo structure decision — Research suggests starting simple (2 packages) but team may prefer Turborepo~~ **RESOLVED**: npm workspaces with shared package
- ~~**Phase 5**: SSE implementation details — Need working code example for Fastify + React SSE before implementation~~ **RESOLVED**: Raw SSE with reply.raw.write() (05-04)
- ~~**Phase 5**: Background job queue library — BullMQ (Redis-based) vs in-memory queue for localhost-only app~~ **RESOLVED**: In-memory queue (05-02)

**Gaps to Address:**

- Chart library final selection: Need to test Recharts with 1000+ EPUB dataset
- Pricing data accuracy: Verify 2026 GPT-4, Claude, Gemini pricing before cost calculator
- Folder browser caching strategy: Large directory trees are slow to scan

**Concerns from 06-02 execution:**
- File upload tested with small files; need to verify performance with large results.json (1000+ EPUBs)

## Session Continuity

Last session: 2026-01-23 20:56
Stopped at: Completed Plan 06-03: Processing Controls
Phase 6 Plan 3 complete - folder input and process button with tokenizer-aware enable logic
Next: Phase 6 Plan 04: Results Table
Resume file: None
