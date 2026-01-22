# Project Research Summary

**Project:** EPUB Tokenizer Counter - Web UI Milestone (v2.0)
**Domain:** React + shadcn/ui Web UI for Existing TypeScript CLI Tool
**Researched:** 2026-01-22
**Confidence:** HIGH

## Executive Summary

This project is adding a modern React-based web UI to an existing Node.js TypeScript CLI tool for EPUB tokenization. Expert practice for this integration pattern involves: (1) keeping the CLI unchanged and extracting business logic into a shared layer, (2) building a Fastify/Express backend that reuses existing tokenization and EPUB processing modules, and (3) creating a React + Vite + shadcn/ui frontend for data visualization and user interaction.

The recommended approach is a **client-server architecture** with the backend reusing all existing CLI modules (`src/tokenizers/`, `src/epub/`, `src/output/`) and the frontend providing data visualization (Recharts), token budget calculation, and real-time processing feedback via Server-Sent Events (SSE). Critical risks include monorepo over-engineering (start with simple packages, not Turborepo), path traversal vulnerabilities in the file browser (validate all paths), and chart performance degradation with large datasets (use ECharts for 1000+ EPUBs).

The research strongly recommends **against** authentication, cloud storage, websockets, databases, and Docker for this v2.0 milestone—these are anti-features for a localhost-only tool. The architecture should use filesystem-based storage (not databases), SSE for progress (not websockets), and direct file system access (not cloud integration). Fastify is preferred over Express for 2-3x better JSON performance and TypeScript-first design.

## Key Findings

### Recommended Stack

[From STACK.md] The stack additions are minimal and focused: React 19.2+ with Vite 7.3+ for the frontend, Fastify 5.7+ for the backend server, and shadcn/ui for UI components. All existing CLI code remains unchanged—only the new server layer imports it.

**Core technologies:**
- **React 19.2 + Vite 7.3** — UI framework and build tool — Fast HMR, optimized builds, official React TypeScript template
- **shadcn/ui + Tailwind CSS 4.0** — Component library — Copy-paste components give full customization, built on Radix UI for accessibility
- **Recharts 3.7** — Data visualization — React-native, composable, declarative API, smaller bundle than Chart.js
- **Fastify 5.7** — Backend server — 2-3x faster than Express, JSON schema validation, TypeScript-first
- **Server-Sent Events (SSE)** — Real-time progress — Simpler than WebSockets, one-way streaming, uses HTTP

**Notable exclusions:**
- No Next.js (overkill for localhost-only UI)
- No authentication libraries (localhost-only scope)
- No database (filesystem storage is sufficient)
- No Docker (adds deployment complexity for local tool)

### Expected Features

[From FEATURES_WEBUI.md] Research of modern web UI patterns and competitor tools (tokencalculator.ai, LiteLLM) reveals clear table stakes and differentiators.

**Must have (table stakes):**
- **Bar charts for token counts** — Users expect visual comparison across books, standard in all token calculator tools
- **Scatter plots (word vs token density)** — Reveals tokenization efficiency, expected in data visualization toolkits
- **Results table with sorting/filtering** — Complements charts, users need precise numbers alongside visuals
- **Token budget calculator** — Core value prop: "I have X tokens, which books fit?" (inverse knapsack solver)
- **results.json upload** — Users process via CLI then visualize in UI, avoids reprocessing
- **EPUB processing from UI** — Web UI should be self-contained, not just a viewer
- **Server-side folder browser** — Users store EPUBs in various folders, hardcoding paths breaks workflows

**Should have (competitive):**
- **Multi-tokenizer comparison visualization** — Shows "Claude uses 15% more tokens than GPT-4" — no existing tool provides this
- **Drag-and-drop EPUB upload** — Bypasses server filesystem, useful for one-off analysis
- **Session persistence (localStorage)** — Survive page refresh, no existing EPUB tool does this

**Defer (v2+):**
- Advanced knapsack solver (greedy is sufficient for MVP)
- Custom tokenizer upload (security risk, use HF selector)
- Background processing queue (complexity for local tool)

### Architecture Approach

[From ARCHITECTURE.md] The architecture follows a **client-server pattern** with a shared business logic layer. The existing CLI pipeline (file discovery → EPUB parsing → tokenization → output) is extracted into a shared package that both CLI and API import. The API layer provides REST endpoints + SSE progress streaming. The frontend is a React SPA that communicates via HTTP/SSE.

**Major components:**
1. **Shared Business Logic** — Reuses all existing CLI modules (tokenizers, EPUB processing, output generation) — no changes needed to core logic
2. **Fastify API Layer** — New server that wraps shared functions in HTTP endpoints, handles file uploads, provides SSE streaming
3. **React Frontend** — Vite + shadcn/ui SPA with TanStack Query for server state, Recharts for visualization
4. **File System Storage** — Server filesystem (no database) — results/, uploads/, cache/ directories

**Recommended structure:** Single-repo (not monorepo) for simplicity: `src/server/` for backend, `web/` for frontend, existing `src/` becomes shared business logic.

### Critical Pitfalls

[From PITFALLS_WEB_UI.md] The research identified 20 specific pitfalls for CLI-to-Web-UI integration. Top 5 most critical:

1. **Path Traversal Vulnerability** — CRITICAL SECURITY: User accesses `../../etc/passwd` via file browser. Validate all paths with `path.normalize()` and check against allow-listed directories. Test path traversal attempts before deployment.
2. **Monorepo Over-Engineering** — Setting up Turborepo/Nx for simple CLI+Web UI wastes hours on configuration. Start with separate packages in same repo, only add tooling if you have 5+ packages.
3. **No Real-Time Progress Updates** — Users click "Process EPUBs" and see nothing for 2 minutes, think app is broken. Use Server-Sent Events (SSE) for progress streaming — simpler than WebSockets.
4. **No Background Job Queue** — Long-running EPUB processing blocks HTTP request, causes timeouts. Use job queue pattern: `POST /api/process` returns job ID immediately, background worker processes, client polls/SSEs for status.
5. **TypeScript Path Alias Hell** — `@/components` works in dev but fails in build. Configure aliases in BOTH `tsconfig.json` AND `vite.config.ts`. Test production build early.

**Other notable pitfalls:** Over-memoization (don't optimize without measuring), chart performance with 1000+ points (use ECharts not Recharts), over-fetching/under-fetching API data, losing CLI features in Web UI (maintain feature parity).

## Implications for Roadmap

Based on combined research, suggested phase structure:

### Phase 1: Foundation & Project Setup
**Rationale:** TypeScript configuration and project structure must be decided first—pitfalls #2 (monorepo over-engineering) and #3 (path alias hell) block all development if misconfigured. Research shows starting simple (2 packages) avoids Turborepo complexity for this scale.

**Delivers:** Working React + Vite + shadcn/ui frontend, Fastify backend with CORS, shared business logic extraction, all builds passing

**Addresses:**
- Stack: React 19.2, Vite 7.3, shadcn/ui setup
- Architecture: Shared business logic layer, client-server boundary

**Avoids:** Pitfalls #2 (monorepo over-engineering), #3 (path alias hell), #14 (missing shared code)

### Phase 2: Backend API & Background Processing
**Rationale:** API endpoints must exist before frontend can fetch data. Real-time progress (SSE) and job queues are foundational—pitfalls #8 and #9 cause UX disasters if deferred. Security (path validation, file upload validation) must be implemented before any file access features.

**Delivers:** Fastify server with `/api/process`, `/api/upload-results`, `/api/files` endpoints, SSE progress streaming, background job queue, security hardening

**Addresses:**
- Features: EPUB processing from UI, results.json upload, server-side folder browser
- Stack: Fastify 5.7, @fastify/cors, @fastify/multipart, SSE implementation

**Uses:** Shared business logic from existing CLI modules (tokenizers, EPUB processing)

**Avoids:** Pitfalls #7 (over/under-fetching), #8 (no real-time updates), #9 (no job queue), #10 (path traversal), #11 (no upload validation), #12 (missing security headers)

### Phase 3: Frontend Core Features
**Rationale:** Now that backend exists, build the primary user workflows. Start simple with useState/useContext (pitfall #5)—only add state management if needed. File upload and tokenizer selection enable the core "process EPUBs" workflow.

**Delivers:** File dropzone component, tokenizer selection interface (GPT-4, Claude, HF models), results.json upload + visualization hydration, basic results display

**Addresses:**
- Features: File upload, tokenizer selection, results.json upload
- Stack: shadcn/ui components (button, card, input, select, dropzone), TanStack Query for server state

**Uses:** API endpoints from Phase 2

**Avoids:** Pitfalls #5 (over-engineering state), #6 (prop drilling vs context overuse), #18 (losing CLI features), #19 (no shared validation)

### Phase 4: Data Visualization
**Rationale:** Charts are the main differentiator over CLI. Implementation must handle expected data sizes—pitfall #16 (chart performance) causes browser hangs with 1000+ EPUBs. Research shows Recharts is fine for <1000 points, use ECharts for larger datasets.

**Delivers:** Bar chart (token counts per EPUB), scatter plot (word vs token density), results table with sorting/filtering, chart interactivity (tooltips, click-to-highlight)

**Addresses:**
- Features: Bar charts, scatter plots, results table
- Stack: Recharts 3.7 (or ECharts if dataset testing shows performance issues)

**Uses:** Data from Phase 3 processing results

**Avoids:** Pitfalls #15 (over-memoization), #16 (chart performance), #17 (large bundle size)

### Phase 5: Token Budget Calculator
**Rationale:** Advanced feature that adds unique value—requires processed data as input. Greedy maximization algorithm is sufficient for MVP; true knapsack solver can be deferred.

**Delivers:** Budget calculator form (token input, tokenizer selection, optimization strategy), "which books fit?" algorithm, cost estimation display, export results to clipboard/JSON

**Addresses:**
- Features: Token budget calculator, cost estimation
- Architecture: Algorithmic solver component (client-side or server-side)

**Uses:** Visualization data from Phase 4

### Phase 6: Polish & Optimization
**Rationale:** Cross-cutting improvements after all features exist. Performance optimization requires measuring first (pitfall #15). Error boundaries and loading states prevent "broken" feel.

**Delivers:** Error boundaries, loading states (skeleton screens), responsive design (mobile/tablet), bundle optimization (code splitting), security hardening review

**Addresses:**
- Features: Loading states, error boundaries, responsive layout
- Architecture: Production-ready deployment

**Avoids:** Pitfalls #15 (over-memoization), #17 (large bundle size), #20 ("localhost only" security mindset)

### Phase Ordering Rationale

- **Foundation first:** TypeScript and project structure decisions (Phase 1) block everything if wrong—pitfall research shows these cause hours of debugging if misconfigured
- **Backend before frontend:** API must exist before UI can use it—Phase 2 endpoints enable Phase 3 features
- **Real-time progress early:** SSE and job queues (Phase 2) are UX requirements, not nice-to-haves—users think app is broken without them
- **Security before file access:** Path validation and upload security (Phase 2) must be implemented before folder browser (Phase 3) or file upload features
- **Core features before visualization:** Phases 2-3 deliver "process EPUBs and see results" workflow—Phase 4 adds visualization polish
- **Optimization last:** Only optimize after measuring (Phase 6)—premature optimization is waste, pitfall #15 explicitly warns against this

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 1:** "Monorepo structure decision" — Need to decide simple packages vs Turborepo based on complexity tolerance. Research suggests starting simple but team may have preferences.
- **Phase 2:** "SSE implementation details" — Need working code example of SSE progress updates with Node.js + React before implementation. Multiple sources agree on SSE but implementation details vary.
- **Phase 2:** "Background job queue library choice" — Need to decide BullMQ (Redis-based, production-ready) vs in-memory queue for localhost-only app. Research suggests in-memory is sufficient but not definitive.

Phases with standard patterns (skip research-phase):

- **Phase 3:** "React + shadcn/ui forms" — Well-documented patterns, official shadcn/ui examples available
- **Phase 4:** "Recharts integration" — Official Recharts docs and examples cover all needed chart types
- **Phase 5:** "Budget calculator algorithms" — Greedy knapsack is CS 101, well-understood problem
- **Phase 6:** "Performance optimization" — Standard React optimization patterns, Lighthouse for auditing

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified with official sources (Vite, React, Fastify, shadcn/ui, Recharts). Version numbers current as of 2026-01-22. |
| Features | HIGH | Based on competitor analysis (tokencalculator.ai, LiteLLM) and modern web UI patterns. Table stakes clear from multiple sources. |
| Architecture | MEDIUM | Client-server pattern is standard, but monorepo vs simple-repo decision needs team input. SSE implementation has multiple valid approaches. |
| Pitfalls | HIGH | 20 pitfalls identified with specific prevention strategies. Most backed by CVEs, official docs, or "avoid this" articles. Critical security pitfalls (#10 path traversal) have HIGH confidence sources. |

**Overall confidence:** HIGH

### Gaps to Address

- **Chart library final selection:** Need to test Recharts with actual EPUB dataset (1000+ books) to confirm performance. If Recharts degrades, switch to ECharts per research recommendation.
- **SSE vs polling trade-off:** Research strongly recommends SSE but implementation details vary. Recommend creating spike test: "Can we stream progress updates from Fastify to React via SSE in <2 hours?"
- **Monorepo tooling decision:** Research says "start simple" but team may prefer Turborepo for consistency with other projects. Decision point for Phase 1.
- **Pricing data accuracy:** Token pricing for GPT-4, Claude, Gemini changes frequently. Verify 2026 pricing before implementing cost calculator.
- **Folder browser caching strategy:** Large directory trees are slow to scan. Need in-memory caching strategy with cache invalidation—research identifies this as gap.

## Sources

### Primary (HIGH confidence)
- [Vite Getting Started](https://vite.dev/guide/) — Build tool features, version 7.3.1 verified
- [shadcn/ui Official Site](https://ui.shadcn.com) — Component library approach, installation docs
- [Fastify Official Site](https://fastify.dev) — Framework features, performance benchmarks (2-3x faster than Express)
- [Recharts Official Site](https://recharts.org) — Charting library API, examples
- [TanStack Query Docs](https://tanstack.com/query/v3/) — Server state management patterns
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) — SSE API documentation
- [CVE-2025-27210: Node.js Path Traversal](https://zeropath.com/blog/cve-2025-27210-nodejs-path-traversal-windows) — Path traversal vulnerability details
- [Express/Multer GitHub](https://github.com/expressjs/multer) — File upload handling

### Secondary (MEDIUM confidence)
- [Fastify vs Express vs Hono: 2025 Comparison](https://betterstack.com/community/guides/scaling-nodejs/fastify-vs-express-vs-hono/) — Framework performance comparison
- [React File Upload Guide 2025](https://magicui.design/blog/react-js-file-upload) — File upload UI patterns
- [Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) — Chart library comparison, includes Recharts
- [Why SSE Beats WebSockets for 95% of Real-Time Apps](https://medium.com/codetodeploy/why-server-sent-events-beat-websockets-for-95-of-real-time-cloud-applications-830eff5a1d7c) — SSE vs WebSockets trade-off
- [React State Management in 2025: What You Actually Need](https://www.developerway.com/posts/react-state-management-2025) — State management patterns, warns against over-engineering
- [Streamlining Full-Stack TypeScript Development with Monorepos](https://leapcell.io/blog/streamlining-full-stack-typescript-development-with-monorepos) — Monorepo patterns, warns against over-engineering

### Tertiary (LOW confidence)
- [AI Token Calculator - tokencalculator.ai](https://tokencalculator.ai/) — Competitor feature analysis (may have changed since research)
- [Google Gemini API Pricing 2026](https://www.metacto.com/blogs/the-true-cost-of-google-gemini-a-guide-to-api-pricing-and-integration) — Pricing reference (verify official sources)
- Various StackOverflow discussions on monorepo TypeScript issues — Edge cases, may not apply to this project

---
*Research completed: 2026-01-22*
*Ready for roadmap: yes*
