# Roadmap: EPUB Tokenizer Counter

## Milestones

- ✅ **v1.0 CLI** - Phases 1-3 (shipped 2026-01-21)
- 🚧 **v2.0 Web UI** - Phases 4-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 CLI (Phases 1-3) - SHIPPED 2026-01-21</summary>

### Phase 1: Foundation
**Goal**: Project scaffolding with TypeScript configuration
**Plans**: 4 plans

Plans:
- [x] 01-01: TypeScript project configuration and CLI scaffolding
- [x] 01-02: EPUB file discovery and scanner module
- [x] 01-03: Error handling infrastructure
- [x] 01-04: Test framework setup

### Phase 2: EPUB Processing
**Goal**: Parse EPUB files and extract text/metadata
**Plans**: 3 plans

Plans:
- [x] 02-01: EPUB parser integration with @gxl/epub-parser
- [x] 02-02: Text extraction from EPUB content
- [x] 02-03: Metadata extraction (title, author, language)

### Phase 3: Tokenization & Output
**Goal**: Multi-tokenizer support with rich output
**Plans**: 6 plans

Plans:
- [x] 03-01: GPT-4 tokenizer (cl100k_base)
- [x] 03-02: Claude tokenizer
- [x] 03-03: Hugging Face tokenizer integration
- [x] 03-04: Word counting with CJK support
- [x] 03-05: JSON output generation
- [x] 03-06: Summary statistics and CLI polish

</details>

---

## 🚧 v2.0 Web UI (In Progress)

**Milestone Goal:** Add a React + shadcn/ui web interface for EPUB processing, data visualization, and token budget calculator.

### Phase 4: Foundation & Project Setup
**Goal**: Working React + Vite + shadcn/ui frontend and Fastify backend with shared business logic layer
**Depends on**: Phase 3 (v1.0 CLI)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04, SETUP-05, SETUP-06
**Success Criteria** (what must be TRUE):
  1. User can visit http://localhost:5173 and see the React app load with shadcn/ui components styled
  2. User can visit http://localhost:8787/api/health and receive {"status":"ok"} response
  3. Frontend can successfully call backend API without CORS errors
  4. Shared TypeScript types can be imported by both frontend and backend without build errors
  5. npm run build compiles both frontend and backend without errors
**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — Frontend scaffolding with Vite + React + TypeScript
- [ ] 04-02-PLAN.md — shadcn/ui installation and theme configuration
- [ ] 04-03-PLAN.md — Backend server scaffolding with Fastify
- [ ] 04-04-PLAN.md — TypeScript shared package configuration

### Phase 5: Backend API & File Processing
**Goal**: Fastify server with EPUB processing endpoints, SSE progress streaming, and security hardening
**Depends on**: Phase 4
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-06, API-07
**Success Criteria** (what must be TRUE):
  1. User can POST to /api/process with EPUB folder path and tokenizer list, receiving job ID immediately
  2. User can subscribe to SSE endpoint and receive real-time progress updates (current EPUB, percentage)
  3. User can upload results.json via POST /api/upload-results and have it validated for schema correctness
  4. Server rejects path traversal attempts (e.g., "../../etc/passwd") with 400 error
  5. Processing continues in background even if client disconnects from SSE
**Plans**: 5 plans

Plans:
- [ ] 05-01: Health check and list-models API endpoints
- [ ] 05-02: EPUB processing endpoint with background job queue
- [ ] 05-03: Server-Sent Events (SSE) progress streaming
- [ ] 05-04: results.json upload and validation endpoint
- [ ] 05-05: Security hardening (path validation, file upload limits)

### Phase 6: File Upload & Tokenizer Selection
**Goal**: Frontend interfaces for file upload, tokenizer selection, and real-time processing feedback
**Depends on**: Phase 5
**Requirements**: TOKEN-01, TOKEN-02, TOKEN-03, TOKEN-04, TOKEN-05, TOKEN-06, TOKEN-07, UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05, UPLOAD-06, UPLOAD-07, UPLOAD-08, UPLOAD-09, UPLOAD-10
**Success Criteria** (what must be TRUE):
  1. User can drag-and-drop results.json file and see it validated and loaded
  2. User can select GPT-4 and Claude tokenizers via checkboxes (both default selected)
  3. User can search Hugging Face models via combobox and see model info cards
  4. User can input EPUB folder path and click "Process" to start processing
  5. User sees real-time progress bar with current/total EPUBs and per-EPUB status updates
  6. User can click "Cancel" button and see processing stop within 2 seconds
  7. Last selected tokenizers are remembered in localStorage and restored on page load
**Plans**: 5 plans

Plans:
- [ ] 06-01: Tokenizer selection interface (checkboxes, combobox, model info cards)
- [ ] 06-02: File upload components (drag-drop, file picker, validation)
- [ ] 06-03: EPUB folder input and process button
- [ ] 06-04: Real-time progress display with SSE integration
- [ ] 06-05: Cancel processing and localStorage persistence

### Phase 7: Data Visualization & Comparison
**Goal**: Interactive charts (bar, scatter, results table) with multi-tokenizer comparison
**Depends on**: Phase 6
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, VIS-06, VIS-07, VIS-08, VIS-09, VIS-10, VIS-11, VIS-12, COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. User sees bar chart showing token counts per EPUB with color-coded bars by tokenizer
  2. User can click bar chart to sort by token count (ascending/descending)
  3. User sees scatter plot showing word count vs token count with trend line
  4. User can hover over any chart element to see tooltip with exact counts and metadata
  5. User sees results table with columns for Title, Author, Words, Tokens, File Path
  6. User can sort table by any column and filter by title/author text search
  7. User can export results table and comparison table to CSV
  8. User sees side-by-side comparison chart showing percentage differences between tokenizers
**Plans**: 4 plans

Plans:
- [ ] 07-01: Bar chart with token counts per EPUB (sortable, color-coded)
- [ ] 07-02: Scatter plot with word vs token density and trend line
- [ ] 07-03: Results table with sorting, filtering, and CSV export
- [ ] 07-04: Multi-tokenizer comparison chart and table

### Phase 8: Token Budget Calculator & Cost Estimation
**Goal**: Token budget calculator with optimization strategies and cost estimation display
**Depends on**: Phase 7
**Requirements**: BUDGET-01, BUDGET-02, BUDGET-03, BUDGET-04, BUDGET-05, BUDGET-06, BUDGET-07, BUDGET-08, BUDGET-09, BUDGET-10, BUDGET-11, BUDGET-12, COST-01, COST-02, COST-03, COST-04
**Success Criteria** (what must be TRUE):
  1. User can input token budget number or select preset (32K, 128K, 200K)
  2. User can select tokenizer and optimization strategy (maximize book count vs maximize words)
  3. User sees selected books list with total tokens used and remaining tokens
  4. User can copy book list to clipboard or download as JSON
  5. User sees estimated dollar cost per provider (OpenAI, Anthropic, Google)
  6. Calculator shows error if budget is insufficient for at least one book
  7. Budget calculator state is saved to localStorage and restored on page load
**Plans**: 4 plans

Plans:
- [ ] 08-01: Budget calculator form (input, presets, tokenizer selection)
- [ ] 08-02: Knapsack solver algorithm for book selection
- [ ] 08-03: Budget display UI (selected books, token usage, export actions)
- [ ] 08-04: Cost estimation display per provider

### Phase 9: Polish, Persistence & Responsive Design
**Goal**: Session persistence, responsive layout, error boundaries, and UX polish
**Depends on**: Phase 8
**Requirements**: PERSIST-01, PERSIST-02, PERSIST-03, PERSIST-04, RESP-01, RESP-02, RESP-03, RESP-04, UX-01, UX-02, UX-03, UX-04, UX-05, UX-06
**Success Criteria** (what must be TRUE):
  1. UI shows prompt to restore saved results on page load if previous session exists
  2. User can click "New Session" button to clear all saved data
  3. Layout works on desktop (1024px+) with side-by-side charts and table
  4. Layout works on tablet (768px-1024px) with stacked layout
  5. Layout works on mobile (<768px) with single column and horizontal scroll for charts
  6. User sees skeleton screens during data fetch and loading spinners on buttons
  7. Error boundaries catch component errors and show friendly message with retry button
  8. All buttons have minimum 44x44px touch targets
**Plans**: 4 plans

Plans:
- [ ] 09-01: Session persistence (localStorage save/restore, new session)
- [ ] 09-02: Responsive layout (desktop, tablet, mobile breakpoints)
- [ ] 09-03: Loading states (skeleton screens, button spinners)
- [ ] 09-04: Error boundaries and error handling (toasts, friendly messages)

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 5 → 6 → 7 → 8 → 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 4/4 | Complete | 2026-01-21 |
| 2. EPUB Processing | v1.0 | 3/3 | Complete | 2026-01-21 |
| 3. Tokenization & Output | v1.0 | 6/6 | Complete | 2026-01-21 |
| 4. Foundation & Project Setup | v2.0 | 0/4 | Not started | - |
| 5. Backend API & File Processing | v2.0 | 0/5 | Not started | - |
| 6. File Upload & Tokenizer Selection | v2.0 | 0/5 | Not started | - |
| 7. Data Visualization & Comparison | v2.0 | 0/4 | Not started | - |
| 8. Token Budget Calculator & Cost Estimation | v2.0 | 0/4 | Not started | - |
| 9. Polish, Persistence & Responsive Design | v2.0 | 0/4 | Not started | - |
