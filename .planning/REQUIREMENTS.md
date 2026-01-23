# Requirements: EPUB Tokenizer Counter

**Defined:** 2026-01-22
**Core Value:** Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.

## v2.0 Requirements

Requirements for Web UI milestone. Each maps to roadmap phases.

### Project Setup

- [x] **SETUP-01**: Project structure configured with separate frontend and backend directories
- [x] **SETUP-02**: Frontend scaffolded with Vite + React + TypeScript
- [x] **SETUP-03**: shadcn/ui installed and configured with theme
- [x] **SETUP-04**: Backend server scaffolded with Fastify
- [x] **SETUP-05**: CORS configured for API communication
- [x] **SETUP-06**: TypeScript shared package configured for code reuse

### Backend API

- [x] **API-01**: Server provides /api/health endpoint for connectivity check
- [x] **API-02**: Server provides /api/list-models endpoint returning available tokenizers
- [x] **API-03**: Server provides /api/process endpoint accepting EPUB folder path and tokenizer list
- [x] **API-04**: Server provides /api/upload-results endpoint for results.json files
- [x] **API-05**: Server implements SSE endpoint for real-time processing progress
- [x] **API-06**: Server validates all file paths to prevent path traversal attacks
- [x] **API-07**: Server implements background job queue for EPUB processing

### Tokenizer Selection Interface

- [ ] **TOKEN-01**: User can select GPT-4 tokenizer via checkbox (default selected)
- [ ] **TOKEN-02**: User can select Claude tokenizer via checkbox (default selected)
- [ ] **TOKEN-03**: User can search and select Hugging Face models via combobox
- [ ] **TOKEN-04**: User sees model info card with vocabulary size and HF model card link
- [ ] **TOKEN-05**: User sees selected tokenizers as tag list with remove buttons
- [ ] **TOKEN-06**: UI validates at least one tokenizer is selected before processing
- [ ] **TOKEN-07**: UI remembers last used tokenizers in localStorage

### File Upload & Processing

- [ ] **UPLOAD-01**: User can upload existing results.json file via drag-and-drop
- [ ] **UPLOAD-02**: User can upload results.json file via file picker button
- [ ] **UPLOAD-03**: UI validates uploaded file is valid JSON with correct schema
- [ ] **UPLOAD-04**: User can input server-side EPUB folder path via text input
- [ ] **UPLOAD-05**: User can trigger EPUB processing from UI via "Process" button
- [ ] **UPLOAD-06**: User sees real-time progress bar showing current/total EPUBs
- [ ] **UPLOAD-07**: User sees per-EPUB status updates (e.g., "Processing: book.epub 50%")
- [ ] **UPLOAD-08**: User sees ETA calculation based on remaining EPUBs and average time
- [ ] **UPLOAD-09**: User can cancel processing mid-run via "Cancel" button
- [ ] **UPLOAD-10**: UI auto-loads visualizations when processing completes

### Data Visualization

- [ ] **VIS-01**: User sees bar chart showing token counts per EPUB (horizontal bars)
- [ ] **VIS-02**: Bar chart is sortable by token count (ascending/descending)
- [ ] **VIS-03**: Bar chart color-codes bars by tokenizer (GPT-4, Claude, HF)
- [ ] **VIS-04**: Bar chart tooltip shows exact counts, word count, file metadata on hover
- [ ] **VIS-05**: User sees scatter plot showing word count vs token count density
- [ ] **VIS-06**: Scatter plot shows trend line for average tokenization ratio
- [ ] **VIS-07**: Scatter plot supports zoom/pan for large datasets (50+ EPUBs)
- [ ] **VIS-08**: User sees results table with columns (Title, Author, Words, Tokens, File Path)
- [ ] **VIS-09**: Results table is sortable by any column (ascending/descending)
- [ ] **VIS-10**: Results table is filterable by title/author text search
- [ ] **VIS-11**: Results table is filterable by token count range slider
- [ ] **VIS-12**: User can export results table to CSV

### Multi-Tokenizer Comparison

- [ ] **COMP-01**: User sees side-by-side bar chart comparing tokenizers per EPUB
- [ ] **COMP-02**: Comparison chart color-codes differences (green=fewer tokens, red=more)
- [ ] **COMP-03**: Comparison chart tooltip shows percentage difference on hover
- [ ] **COMP-04**: User can export comparison table to CSV

### Token Budget Calculator

- [ ] **BUDGET-01**: User can input token budget via number input
- [ ] **BUDGET-02**: User can select token budget presets (32K, 128K, 200K)
- [ ] **BUDGET-03**: User can select tokenizer for budget calculation (dropdown)
- [ ] **BUDGET-04**: User can select optimization strategy (maximize book count vs maximize words)
- [ ] **BUDGET-05**: User sees selected books list from budget calculation
- [ ] **BUDGET-06**: User sees total tokens used (progress bar) and remaining tokens
- [ ] **BUDGET-07**: User sees total books selected and total word count
- [ ] **BUDGET-08**: User can copy book list to clipboard
- [ ] **BUDGET-09**: User can download book list as JSON
- [ ] **BUDGET-10**: UI validates budget is sufficient for at least one book
- [ ] **BUDGET-11**: User sees cost estimation display (dollar cost per provider)
- [ ] **BUDGET-12**: Budget calculator saves state to localStorage

### Cost Estimation

- [ ] **COST-01**: User sees estimated dollar cost based on token count
- [ ] **COST-02**: Cost estimation shows pricing per provider (OpenAI, Anthropic, Google)
- [ ] **COST-03**: Cost estimation links to official pricing pages
- [ ] **COST-04**: UI displays note that costs are estimates only

### Session Persistence

- [ ] **PERSIST-01**: UI auto-saves processing results to localStorage on completion
- [ ] **PERSIST-02**: UI prompts to restore saved results on page load
- [ ] **PERSIST-03**: User can clear saved data via "New Session" button
- [ ] **PERSIST-04**: UI shows warning if localStorage 5MB limit is exceeded

### Responsive Design

- [ ] **RESP-01**: Layout works on desktop (1024px+) with side-by-side charts and table
- [ ] **RESP-02**: Layout works on tablet (768px-1024px) with stacked layout
- [ ] **RESP-03**: Layout works on mobile (<768px) with single column and horizontal scroll for charts
- [ ] **RESP-04**: Touch targets are minimum 44x44px for buttons

### Error Handling & UX

- [ ] **UX-01**: UI displays skeleton screens during data fetch
- [ ] **UX-02**: UI shows loading spinners on buttons during async operations
- [ ] **UX-03**: UI shows error toast after 30s timeout without response
- [ ] **UX-04**: Error boundaries catch component rendering errors
- [ ] **UX-05**: Error boundaries display friendly error message with retry button
- [ ] **UX-06**: Error boundaries log error stack to console (no telemetry)

## Future Requirements

Deferred to future milestones.

### Advanced Features

- Drag-and-drop EPUB upload (bypass server filesystem)
- Advanced knapsack solver for optimal budget maximization
- Server-side folder browser with directory tree and EPUB count badges
- Per-chapter token breakdown
- Streaming/chunked tokenization for large EPUBs
- Tokenizer caching for repeated runs

### Infrastructure

- User authentication
- Cloud storage integration
- Database persistence
- Docker/containerization
- Multi-user collaboration

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| DRM handling | Legal complexity, tool skips DRMed EPUBs with warning |
| Text file export | Users want counts, not extracted text |
| EPUB modification | Tool is read-only analyzer only |
| Other document formats (PDF, DOCX) | EPUB only for v2.0 |
| Real-time watch mode | Manual execution only |
| User authentication | Localhost-only access for v2.0 |
| Websockets for progress | SSE is sufficient, less complexity |
| EPUB content editing | Out of scope, tool is analyzer |
| Multi-user collaboration | Localhost-only, no backend database |
| Background job queue persistence | Immediate processing only |
| Custom tokenizer upload | Security risk, use Hugging Face models |
| Database persistence | File-based JSON storage is sufficient |
| Docker/containerization | npm start is sufficient for local development |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 4 | Pending |
| SETUP-02 | Phase 4 | Pending |
| SETUP-03 | Phase 4 | Pending |
| SETUP-04 | Phase 4 | Pending |
| SETUP-05 | Phase 4 | Pending |
| SETUP-06 | Phase 4 | Pending |
| API-01 | Phase 5 | Pending |
| API-02 | Phase 5 | Pending |
| API-03 | Phase 5 | Pending |
| API-04 | Phase 5 | Pending |
| API-05 | Phase 5 | Pending |
| API-06 | Phase 5 | Pending |
| API-07 | Phase 5 | Pending |
| TOKEN-01 | Phase 6 | Pending |
| TOKEN-02 | Phase 6 | Pending |
| TOKEN-03 | Phase 6 | Pending |
| TOKEN-04 | Phase 6 | Pending |
| TOKEN-05 | Phase 6 | Pending |
| TOKEN-06 | Phase 6 | Pending |
| TOKEN-07 | Phase 6 | Pending |
| UPLOAD-01 | Phase 6 | Pending |
| UPLOAD-02 | Phase 6 | Pending |
| UPLOAD-03 | Phase 6 | Pending |
| UPLOAD-04 | Phase 6 | Pending |
| UPLOAD-05 | Phase 6 | Pending |
| UPLOAD-06 | Phase 6 | Pending |
| UPLOAD-07 | Phase 6 | Pending |
| UPLOAD-08 | Phase 6 | Pending |
| UPLOAD-09 | Phase 6 | Pending |
| UPLOAD-10 | Phase 6 | Pending |
| VIS-01 | Phase 7 | Pending |
| VIS-02 | Phase 7 | Pending |
| VIS-03 | Phase 7 | Pending |
| VIS-04 | Phase 7 | Pending |
| VIS-05 | Phase 7 | Pending |
| VIS-06 | Phase 7 | Pending |
| VIS-07 | Phase 7 | Pending |
| VIS-08 | Phase 7 | Pending |
| VIS-09 | Phase 7 | Pending |
| VIS-10 | Phase 7 | Pending |
| VIS-11 | Phase 7 | Pending |
| VIS-12 | Phase 7 | Pending |
| COMP-01 | Phase 7 | Pending |
| COMP-02 | Phase 7 | Pending |
| COMP-03 | Phase 7 | Pending |
| COMP-04 | Phase 7 | Pending |
| BUDGET-01 | Phase 8 | Pending |
| BUDGET-02 | Phase 8 | Pending |
| BUDGET-03 | Phase 8 | Pending |
| BUDGET-04 | Phase 8 | Pending |
| BUDGET-05 | Phase 8 | Pending |
| BUDGET-06 | Phase 8 | Pending |
| BUDGET-07 | Phase 8 | Pending |
| BUDGET-08 | Phase 8 | Pending |
| BUDGET-09 | Phase 8 | Pending |
| BUDGET-10 | Phase 8 | Pending |
| BUDGET-11 | Phase 8 | Pending |
| BUDGET-12 | Phase 8 | Pending |
| COST-01 | Phase 8 | Pending |
| COST-02 | Phase 8 | Pending |
| COST-03 | Phase 8 | Pending |
| COST-04 | Phase 8 | Pending |
| PERSIST-01 | Phase 9 | Pending |
| PERSIST-02 | Phase 9 | Pending |
| PERSIST-03 | Phase 9 | Pending |
| PERSIST-04 | Phase 9 | Pending |
| RESP-01 | Phase 9 | Pending |
| RESP-02 | Phase 9 | Pending |
| RESP-03 | Phase 9 | Pending |
| RESP-04 | Phase 9 | Pending |
| UX-01 | Phase 9 | Pending |
| UX-02 | Phase 9 | Pending |
| UX-03 | Phase 9 | Pending |
| UX-04 | Phase 9 | Pending |
| UX-05 | Phase 9 | Pending |
| UX-06 | Phase 9 | Pending |

**Coverage:**
- v2.0 requirements: 73 total
- Mapped to phases: 73
- Unmapped: 0 ✓

**Phase distribution:**
- Phase 4 (Foundation): 6 requirements (SETUP)
- Phase 5 (Backend API): 7 requirements (API)
- Phase 6 (Upload & Tokenizer): 17 requirements (TOKEN, UPLOAD)
- Phase 7 (Visualization): 16 requirements (VIS, COMP)
- Phase 8 (Budget Calculator): 16 requirements (BUDGET, COST)
- Phase 9 (Polish): 11 requirements (PERSIST, RESP, UX)

---
*Requirements defined: 2026-01-22*
*Last updated: 2026-01-22 after roadmap creation*
