# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.
**Current focus:** Phase 9: Polish, Persistence & Responsive Design

## Current Position

Phase: 9 of 9 (Polish, Persistence & Responsive Design)
Plan: 0 of 4 in current phase
Status: Phase not started
Last activity: 2026-01-24 — Completed Phase 8: Token Budget Calculator

Progress: [██████████░] 92.5% (37/40 total plans complete: 13 from v1.0, 24 from v2.0)

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
- Total plans completed: 35 (13 from v1.0 + 22 from v2.0)
- Total execution time: ~14.5 hours (v1.0: ~7.25h, v2.0: ~7.3h)
- Average per plan: ~12 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 (v1.0) | 4 | ~1h | ~15 min |
| 2 (v1.0) | 3 | ~0.5h | ~10 min |
| 3 (v1.0) | 6 | ~5.5h | ~55 min |
| 4 (v2.0) | 4 | ~45 min | ~11 min |
| 5 (v2.0) | 5 | ~1.5h | ~18 min |
| 6 (v2.0) | 5 | ~2.2h | ~26 min |
| 7 (v2.0) | 5 | ~155 min | ~31 min |
| 8 (v2.0) | 4 | ~51 min | ~13 min |

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
- **Function export for ProcessingProgress** - Simple `export function` instead of forwardRef pattern for cleaner API (06-04)
- **Striped animation overlay** - CSS stripes as separate overlay div rather than modifying Progress component (06-04)
- **ETA from elapsed time per EPUB** - ETA calculated from average processing time, not file size (06-04)
- **Green success card for completion** - CompletionSummary uses Tailwind green classes for visual success indicator (06-04)
- **Graceful degradation for cancel endpoint** - Frontend continues with SSE disconnect even if POST /api/cancel/:jobId fails (06-05)
- **forwardRef + useImperativeHandle pattern** - Clean React API for exposing child component methods to parent (06-05)
- **Reset preserves tokenizer selections** - User convenience to remember preferences across processing runs (06-05)
- **Separate isCancelled state** - Distinct from processing state enables clear UI messaging (06-05)
- **ChartContainer with ResponsiveContainer** - Wrap all charts in ResponsiveContainer with default height of 300px for consistent automatic resizing (07-01)
- **Separate chart per tokenizer** - Render individual bar chart for each tokenizer instead of grouped bars for clearer visualization (07-01)
- **Tokenizer color palette with HSL values** - Blue for GPT-4, orange for Claude, green for HF models matching shadcn/ui color system (07-01)
- **Angled x-axis labels for bar charts** - Use angle=-45 with 80px height to prevent label overlap on long EPUB titles (07-01)
- **Sort toggle default to descending** - Show highest token counts first for immediate insight (07-01)
- **Error filtering for visualizations** - Filter out EPUBs with error property before chart transformation to avoid negative/zero values (07-01)
- **react-papaparse CSV export pattern** - useCSVDownloader takes no arguments, returns object with CSVDownloader component that accepts data/filename as props (07-01)
- **Recharts lineType='fitting' for linear regression** - Built-in trend line rendering without external math library (07-02)
- **Solid circle points with white stroke** - fillOpacity=1 with stroke="white" for better visibility than transparent points (07-02)
- **Brush component on x-axis for zoom** - Recharts Brush provides zoom/pan without additional state management (07-02)
- **groupBy utility for data transformation** - Generic grouping function for organizing scatter points by tokenizer (07-02)
- **TanStack Table over AG Grid** - Headless table allows full UI control, AG Grid is enterprise/complex (07-03)
- **Collapsible search filter** - Search input hidden by default, toggled via icon button to save vertical space (07-03)
- **Dual-handle slider for token range** - Single component shows min/max bounds visually with two draggable handles (07-03)
- **Default sort by token count descending** - Table sorts by primary tokenizer token count descending by default (07-03)
- **Comfortable row spacing (py-4)** - Generous vertical padding for easier scanning of data-dense results (07-03)
- **Sequential green color scale for heatmap** - Lighter colors (green-100) for baseline/efficient tokenizers, darker (green-500) for less efficient (07-04)
- **Percentage relative to lowest count per EPUB** - Each EPUB normalized independently for multi-tokenizer comparison (07-04)
- **Tooltip via title attribute for heatmap** - Native browser tooltip for simplicity, avoiding additional component complexity (07-04)
- **Sticky EPUB title column for horizontal scroll** - Leftmost column sticks during scroll to maintain context (07-04)
- **Conditional heatmap rendering (2+ tokenizers)** - Comparison only meaningful with multiple tokenizers (07-04)
- **Limit to top 20 EPUBs by word count for bar chart** - Prevents overcrowding in side-by-side comparison view (07-05)
- **Sort alphabetically by title for bar chart** - Consistent display ordering across comparison visualizations (07-05)
- **Angled x-axis labels (-45 degrees) for grouped bar chart** - Prevents label overlap with many EPUBs (07-05)
- **Custom tooltip with percentage calculations vs baseline** - Shows both absolute count and relative difference (07-05)
- **Grouped bars pattern for categorical comparison** - Multiple Bar series per tokenizer side by side (07-05)
- **Greedy O(n log n) knapsack algorithms** - Max Books (shortest-first), Max Words (longest-fit), Balanced (ratio-based) for budget optimization (08-02)
- **2026-01 pricing data with quarterly update** - Provider pricing for OpenAI, Anthropic, Google with update recommendation (08-02)
- **useDebounce for 500ms delayed recalculation** - Prevents excessive knapsack recalculation during input changes (08-02)
- **Memoized budget calculations with useMemo** - Expensive knapsack computations cached to avoid redundant work (08-02)
- **TanStack Table pattern for sortable data display** - useReactTable with getCoreRowModel, getSortedRowModel, sorting state (08-03)
- **Clipboard API with execCommand fallback** - navigator.clipboard.writeText with document.execCommand fallback for broader compatibility (08-03)
- **Blob API for client-side JSON generation** - Blob -> createObjectURL -> anchor click -> revokeObjectURL cleanup pattern (08-03)
- **Radix UI Tabs for strategy selection** - shadcn/ui component with built-in accessibility for Max Books/Max Words/Balanced options (08-01)
- **Preset buttons with variant highlighting** - default variant for active preset, outline for inactive, provides quick budget selection (32K/128K/200K) (08-01)
- **localStorage persistence for budget form** - Budget, tokenizer, and strategy selections persist across sessions via useLocalStorage hook (08-01)
- **Conditional BudgetCalculator rendering** - Only shows when processingResults exists with valid results array (08-01)
- **Input-only cost calculation for EPUB processing** - All tokens considered input (reading text), outputMultiplier defaults to 0 for cost estimates (08-04)
- **4 decimal place cost formatting** - Display costs with 4 decimal places (e.g., $0.1125) for precision with smaller token counts (08-04)
- **Quarterly pricing update schedule** - PRICING_METADATA tracks lastUpdated and nextReview for pricing maintenance cadence (08-04)

### Pending Todos

- Phase 8: ~~Token Budget Calculator~~ COMPLETE (all 4 plans)
- Phase 9: Polish, Persistence & Responsive Design (4 plans) - NEXT

### Blockers/Concerns

**Research Flags (from research/SUMMARY.md):**

- ~~**Phase 4**: Monorepo structure decision — Research suggests starting simple (2 packages) but team may prefer Turborepo~~ **RESOLVED**: npm workspaces with shared package
- ~~**Phase 5**: SSE implementation details — Need working code example for Fastify + React SSE before implementation~~ **RESOLVED**: Raw SSE with reply.raw.write() (05-04)
- ~~**Phase 5**: Background job queue library — BullMQ (Redis-based) vs in-memory queue for localhost-only app~~ **RESOLVED**: In-memory queue (05-02)

**Gaps to Address:**

- Chart library final selection: Need to test Recharts with 1000+ EPUB dataset
- ~~Pricing data accuracy: Verify 2026 GPT-4, Claude, Gemini pricing before cost calculator~~ **RESOLVED**: 2026-01 pricing data added with quarterly update recommendation (08-02)
- Folder browser caching strategy: Large directory trees are slow to scan

**Concerns from 06-02 execution:**
- File upload tested with small files; need to verify performance with large results.json (1000+ EPUBs)

**Concerns from 06-05 execution:**
- Backend POST /api/cancel/:jobId endpoint may not exist yet; frontend handles gracefully but endpoint should be added for complete functionality

**Concerns from 07-01 through 08-02 execution:**
- None

## Session Continuity

Last session: 2026-01-24 (current session)
Stopped at: Completed Phase 8: Token Budget Calculator (4/4 plans complete)
Next: Phase 9: Polish, Persistence & Responsive Design (0/4 plans)
Resume file: None
