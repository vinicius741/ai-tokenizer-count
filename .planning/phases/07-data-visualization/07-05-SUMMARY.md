---
phase: 07-data-visualization
plan: 05
subsystem: ui
tags: [recharts, visualization, comparison, bar-chart, typescript, react]

# Dependency graph
requires:
  - phase: 07-01
    provides: Base visualization infrastructure and chart utilities
provides:
  - Side-by-side grouped bar chart component for tokenizer comparison
  - Absolute token count visualization complementing percentage heatmap
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Grouped bar chart pattern with multiple Bar series
    - Conditional rendering based on tokenizer count
    - Data transformation pipeline (EpubResult[] → chart data)

key-files:
  created:
    - web/src/components/visualization/ComparisonBarChart.tsx
  modified:
    - web/src/App.tsx

key-decisions:
  - "Limit to top 20 EPUBs by word count to prevent overcrowding"
  - "Sort alphabetically by title for consistent ordering"
  - "Angle x-axis labels at -45 degrees for better readability with many EPUBs"
  - "Only render when 2+ tokenizers present (comparison requires at least 2)"

patterns-established:
  - "Pattern: Grouped bars for categorical comparison (tokenizer per EPUB)"
  - "Pattern: Custom tooltip with percentage calculations vs baseline"
  - "Pattern: Conditional component rendering based on data availability"

# Metrics
duration: 12min
completed: 2026-01-24
---

# Phase 7 Plan 5: Side-by-Side Comparison Bar Chart Summary

**Side-by-side grouped bar chart showing absolute token counts for each tokenizer per EPUB using recharts**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-24 (estimated from first task commit)
- **Completed:** 2026-01-24
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Implemented side-by-side comparison bar chart with grouped bars for each tokenizer per EPUB
- Added custom tooltip showing exact token counts and percentage differences vs lowest tokenizer
- Integrated chart into App.tsx alongside heatmap in comparison visualization section
- Only renders when 2+ tokenizers present (comparison requires at least 2)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ComparisonBarChart component** - `03115a1` (feat)
2. **Task 3: Integrate ComparisonBarChart into App.tsx** - `de37331` (feat)

**Plan metadata:** (to be committed)

## Files Created/Modified

- `web/src/components/visualization/ComparisonBarChart.tsx` - Side-by-side grouped bar chart component (239 lines)
- `web/src/App.tsx` - Added import and rendering logic for ComparisonBarChart

## Decisions Made

- Limited to top 20 EPUBs by word count to prevent overcrowding in the chart
- Sort alphabetically by title for consistent display ordering
- Angle x-axis labels at -45 degrees for better readability with many EPUBs
- Only render when 2+ tokenizers present (comparison requires at least 2)
- Custom tooltip shows both percentage of lowest and absolute percentage difference
- Use same TOKENIZER_COLORS constants as other visualizations for consistency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation proceeded smoothly following established patterns from ComparisonHeatmap.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Completed:** Phase 7, Plan 5

**Ready for:** Next visualization plan or phase transition

**Dependencies:** All previous phase 7 plans (07-01 through 07-04) completed successfully

**No blockers or concerns.**

---
*Phase: 07-data-visualization*
*Completed: 2026-01-24*
