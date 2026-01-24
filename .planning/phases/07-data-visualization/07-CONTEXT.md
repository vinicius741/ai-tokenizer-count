# Phase 7: Data Visualization & Comparison - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

## Phase Boundary

Interactive data visualization for token analysis results — bar charts, scatter plots, results table, and multi-tokenizer comparison views. Users can explore token counts across EPUBs visually and compare how different tokenizers behave on the same content.

## Implementation Decisions

### Bar chart design
- **Separate charts per tokenizer** — Each tokenizer gets its own bar chart (not grouped/split bars)
- **Vertical orientation** — EPUB names on x-axis, token counts on y-axis
- **Tokenizer-specific colors** — Distinct colors per tokenizer (e.g., blue for GPT-4, orange for Claude, green for HF)
- **Toggle button for sorting** — Toggle button on chart switches between ascending/descending sort (not click-to-sort on axis)

### Scatter plot design
- **Solid circle points** — Solid circles with border stroke (clean, visible), not transparent
- **Visual trend line only** — Show linear regression trend line without equation text overlay
- **Single plot for all tokenizers** — All tokenizers on same plot with different colored points (not toggle-based)

### Table layout
- **Default sort by token count** — Sort by the primary tokenizer's token count by default (not title or file order)
- **Comfortable row density** — Generous spacing with larger row heights for easier scanning
- **Collapsible filter input** — Search filter shows only after clicking a search icon/button (not always visible)

### Comparison view
- **Percentage vs lowest count** — Percentages calculated relative to the lowest token count across tokenizers
- **Heatmap grid format** — Grid with EPUBs as rows, tokenizers as columns, cells show percentage
- **Sequential color scale** — Light to dark green scale = higher percentage (not diverging red/green)

### Claude's Discretion
- Exact color values for tokenizer-specific palette
- Scatter plot point sizing
- Table column width proportions
- Heatmap color bin boundaries (how many shades, where thresholds fall)
- Tooltip content detail level (beyond required counts/metadata)

## Specific Ideas

No specific requirements — open to standard visualization best practices for each chart type.

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 07-data-visualization*
*Context gathered: 2026-01-24*
