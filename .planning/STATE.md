# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.
**Current focus:** Phase 4: Foundation & Project Setup

## Current Position

Phase: 4 of 6 (Phase 4: Foundation & Project Setup)
Plan: 4 of 4 in current phase
Status: Phase complete
Last activity: 2026-01-23 — Completed 04-04: Shared TypeScript package with dual CJS/ESM builds

Progress: [████████░░░░] 60% (4/4 plans in phase 4 complete, 12/20 total plans)

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
- Total plans completed: 17 (13 from v1.0 + 4 from v2.0)
- Total execution time: ~8 hours (v1.0: ~7.25h, v2.0: ~45 min)
- Average per plan: ~11 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 (v1.0) | 4 | ~1h | ~15 min |
| 2 (v1.0) | 3 | ~0.5h | ~10 min |
| 3 (v1.0) | 6 | ~5.5h | ~55 min |
| 4 (v2.0) | 4 | ~45 min | ~11 min |

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

### Pending Todos

None.

### Blockers/Concerns

**Research Flags (from research/SUMMARY.md):**

- ~~**Phase 4**: Monorepo structure decision — Research suggests starting simple (2 packages) but team may prefer Turborepo~~ **RESOLVED**: npm workspaces with shared package
- **Phase 5**: SSE implementation details — Need working code example for Fastify + React SSE before implementation
- **Phase 5**: Background job queue library — BullMQ (Redis-based) vs in-memory queue for localhost-only app

**Gaps to Address:**

- Chart library final selection: Need to test Recharts with 1000+ EPUB dataset
- Pricing data accuracy: Verify 2026 GPT-4, Claude, Gemini pricing before cost calculator
- Folder browser caching strategy: Large directory trees are slow to scan

## Session Continuity

Last session: 2026-01-23 13:34
Stopped at: Completed 04-04-PLAN.md (Shared TypeScript package with dual CJS/ESM builds)
Phase 4 complete - ready for Phase 5: Web UI Development
Resume file: None
