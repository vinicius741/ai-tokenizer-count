---
phase: 07-data-visualization
plan: 01
subsystem: ui
tags: [recharts, bar-chart, visualization, token-count]

# Dependency graph
requires:
  - phase: 06-file-upload-tokenizer-selection
    provides: ResultsOutput type, processing results state, CompletionSummary component
provides:
  - Per-tokenizer bar chart component with sorting toggle
  - Chart utilities (color palette, formatters)
  - Custom tooltip component for rich hover information
  - ChartContainer wrapper for responsive layout
affects: [scatter-plots, comparison-heatmap, cost-calculator]

# Tech tracking
tech-stack:
  added: [recharts (already installed), react-papaparse, @tanstack/react-table]
  patterns:
    - Chart data transformation with useMemo for performance
    - ResponsiveContainer for automatic chart resizing
    - Custom tooltip with rich metadata display
    - Tokenizer color palette with HSL values

key-files:
  created:
    - web/src/components/visualization/BarChart.tsx
    - web/src/components/visualization/CustomTooltip.tsx
    - web/src/components/visualization/ChartContainer.tsx
  modified:
    - web/src/lib/chart-utils.ts
    - web/src/App.tsx
    - web/package.json (added react-papaparse, @tanstack/react-table)

key-decisions:
  - "ChartContainer wraps charts in ResponsiveContainer for automatic resizing"
  - "Custom tooltip shows full EPUB metadata (title, author, words, tokens, file path)"
  - "Separate chart per tokenizer instead of grouped bars for clearer visualization"
  - "Sort toggle switches between ascending/descending order with visual indicator"

patterns-established:
  - "Pattern: Memoized data transformation for chart performance"
  - "Pattern: Angled x-axis labels (angle=-45) to prevent overlap"
  - "Pattern: Filter out failed EPUBs (results with error property) before visualization"
  - "Pattern: Tokenizer-specific color mapping using getTokenizerColor utility"

# Metrics
duration: 28min
completed: 2026-01-24
---

# Phase 7: Plan 1 Summary

**Per-tokenizer bar charts with sortable bars, color-coded by tokenizer, and rich tooltips using Recharts library**

## Performance

- **Duration:** 28 minutes
- **Started:** 2026-01-24T11:55:38Z
- **Completed:** 2026-01-24T12:23:43Z
- **Tasks:** 4 completed
- **Files modified:** 7 files created/modified

## Accomplishments

- **TokenizerBarChart component** with sorting toggle (ascending/descending) and color-coded bars
- **Chart utilities** with tokenizer color palette (GPT-4: blue, Claude: orange, HF: green) and number formatters
- **CustomTooltip component** displaying title, author, word count, token count, and file path on hover
- **ChartContainer wrapper** providing Card layout with ResponsiveContainer for automatic resizing
- **Integration into App.tsx** with "Token Count Analysis" section showing charts for each tokenizer

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Recharts and create chart utilities** - `8e4197a` (feat)
2. **Task 2: Create shared tooltip and container components** - `c8b33a8` (feat)
3. **Task 3: Create BarChart component with sorting** - (already existed from previous session)
4. **Task 4: Integrate BarChart into App.tsx** - `213335e` (feat)
5. **Style: Increase max-width** - `05aa428` (style)

**Blocking fixes:** `cb7420b` (fix: resolved TypeScript build errors from other plans)

## Files Created/Modified

### Created
- `web/src/components/visualization/BarChart.tsx` - Per-tokenizer bar chart with sorting toggle
- `web/src/components/visualization/CustomTooltip.tsx` - Shared tooltip with rich metadata display
- `web/src/components/visualization/ChartContainer.tsx` - Card wrapper with ResponsiveContainer

### Modified
- `web/src/lib/chart-utils.ts` - Added HF model color prefix matching, additional tokenizer colors
- `web/src/App.tsx` - Integrated bar charts into completion section, added getTokenizerDisplayName helper
- `web/package.json` - Added react-papaparse and @tanstack/react-table dependencies

## Decisions Made

- **ChartContainer pattern**: Wrap all charts in ResponsiveContainer with default height of 300px for consistent sizing
- **Separate charts per tokenizer**: Render individual bar chart for each tokenizer instead of grouped bars for clearer visualization
- **Color coding**: Use HSL values matching shadcn/ui color system (blue for GPT-4, orange for Claude, green for HF)
- **X-axis labels**: Angle at -45 degrees with 80px height to prevent label overlap on long EPUB titles
- **Sort toggle default**: Default to descending order (highest token counts first) for immediate insight
- **Error filtering**: Filter out EPUBs with error property before chart transformation to avoid negative/zero values

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript build errors from other plans**
- **Found during:** Pre-checkpoint verification (dev server preparation)
- **Issue:** Multiple TypeScript compilation errors in ResultsTable, ScatterChart, csv-export from other incomplete plans
- **Fix:**
  - Fixed ChartContainer: use type-only import for ResponsiveContainerProps
  - Fixed BarChart: removed unused ChartDataPoint interface
  - Fixed ResultsTable: removed unused imports, updated CSV export API usage
  - Fixed ScatterChart: use filePath from result metadata instead of metadata.filePath
  - Fixed csv-export: updated useCsvExport to match react-papaparse API (returns object with CSVDownloader)
  - Installed missing dependencies: @tanstack/react-table, papaparse, react-papaparse
- **Files modified:** web/src/components/visualization/ResultsTable.tsx, web/src/components/visualization/ScatterChart.tsx, web/src/lib/csv-export.ts, web/src/components/visualization/ChartContainer.tsx, web/src/components/visualization/BarChart.tsx, package.json, package-lock.json, web/package.json
- **Verification:** Build succeeded with "built in 2.54s"
- **Committed in:** `cb7420b` (part of blocking fixes commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Build error fix was necessary for checkpoint verification. No scope creep.

## Issues Encountered

- **react-papaparse API mismatch**: The useCSVDownloader hook takes no arguments and returns an object with CSVDownloader component, but the code was trying to pass data/filename as arguments. Fixed by destructuring the return value and passing props to the component directly.
- **Missing dependencies**: @tanstack/react-table and react-papaparse were not installed but referenced by other plan files. Installed them to resolve build errors.
- **TypeScript strict mode**: Required type-only imports for types used as values (e.g., `type ResponsiveContainerProps`).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Bar chart infrastructure complete, ready for scatter plots (already implemented) and comparison heatmaps
- Chart utilities (colors, formatters) available for all future visualizations
- CustomTooltip can be reused across different chart types
- No blockers identified

## Verification Criteria (Checkpoint)

User should verify:
1. Upload results.json or process EPUBs to get results
2. Bar charts render for each tokenizer showing token counts per EPUB
3. Bars are color-coded (blue for GPT-4, orange for Claude, green for HF models)
4. Sort toggle button switches between ascending/descending order with arrow indicator
5. Hovering over any bar shows tooltip with title, author, words, tokens, file path
6. X-axis labels are angled and don't overlap
7. Charts are responsive and resize with window width

---
*Phase: 07-data-visualization*
*Plan: 01*
*Completed: 2026-01-24*
