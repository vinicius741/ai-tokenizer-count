# Phase 8: Token Budget Calculator & Cost Estimation - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Token budget calculator that helps users select EPUBs within a token budget constraint using knapsack optimization algorithms. Users can input a budget, choose an optimization strategy, see selected books with token usage, and view estimated processing costs per LLM provider (OpenAI, Anthropic, Google).

</domain>

<decisions>
## Implementation Decisions

### Budget input & presets
- Number input field + clickable preset buttons (32K, 128K, 200K)
- Block zero/empty values — calculate button disabled until user enters budget > 0
- Allow over-budget input (larger than total tokens in all EPUBs) — show warning indicator
- Presets: 32K, 128K, 200K only (from roadmap)

### Optimization strategies
- Three strategies via Tabs/SegmentedControl: "Max Books" | "Max Words" | "Balanced"
- Max Books: shortest books first to maximize count
- Max Words: longest books that fit to maximize total words
- Balanced: ratio-based selection (token density consideration)
- Debounced auto-recalculate (500ms) when strategy changes — no manual button

### Selected books display
- Full table like results table: Title, Author, Words, Tokens columns
- Sortable and filterable (reuse TanStack Table patterns from Phase 7)
- Summary bar at top: "15 selected · 45,231 / 128,000 tokens (64% used)"
- Editable selection: users can click checkbox or "Add to selection" on non-selected books
- Export options: copy to clipboard, download as JSON

### Cost estimation display
- Cards per provider with logo/name: OpenAI, Anthropic, Google
- Each card shows: provider name, price per 1M tokens, calculated cost for selection
- Toggle between "Selected books" cost and "All EPUBs" cost view
- Pricing accuracy: "As of 2026-01" with link to provider pricing page in footer
- Costs based on token count from selected tokenizer (GPT-4, Claude, or HF model)

### Claude's Discretion
- Exact debounce timing (500ms suggested, may adjust for UX)
- Visual design of provider cards (icons, layout, emphasis)
- Knapsack algorithm implementation details (0/1 knapsack vs approximation)
- Error messaging for insufficient budget (at least one book won't fit)
- localStorage key naming and persistence strategy

</decisions>

<specifics>
## Specific Ideas

- Budget calculator should feel like a planning tool, not just a form
- Three strategies give users control over what they value: quantity vs depth vs balance
- Provider cards help users compare costs at a glance before choosing an API
- Editable selection lets users override the algorithm if they have specific books in mind

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-token-budget-calculator*
*Context gathered: 2026-01-24*
