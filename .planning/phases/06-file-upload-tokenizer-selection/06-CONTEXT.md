# Phase 6: File Upload & Tokenizer Selection - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Frontend interfaces for uploading results.json, selecting tokenizers (GPT-4, Claude, Hugging Face), inputting EPUB folder paths, and monitoring processing progress with real-time SSE feedback. Visualization and comparison are separate phases (Phase 7-8).

</domain>

<decisions>
## Implementation Decisions

### Tokenizer selection UI
- **Unified list layout** — All tokenizers (GPT-4, Claude, Hugging Face) in a single list, not separate sections
- **Toggle chip style** — Tokenizers displayed as clickable chips/pills that toggle selected state
- **Remember last selection** — Selection persisted to localStorage, restored on page load (not hardcoded defaults)
- **Model info on hover** — Hugging Face models show info card/popover on hover with details (vocab size, context window, provider)

### File upload behavior
- **Prominent drop zone** — Large designated area with dashed border, icon, and "Drop file here" text when empty
- **Compact file chip after selection** — Zone shrinks to small chip showing filename with X button to remove
- **Toast notifications for errors** — Validation errors (invalid JSON, wrong schema) shown as toasts that auto-dismiss
- **Zone expands on drag** — Drop zone expands slightly when file is dragged over it

### Processing controls
- **Text input for folder path** — Text input field for entering server-side EPUB folder path (browsers cannot pick server-side folders directly)
- **Edit mode for path modification** — Path shown read-only when set, edit button opens text input for changes
- **Auto-enable Process button** — Button disabled until tokenizers selected AND folder chosen, then becomes enabled
- **Cancel button shows only during processing** — Hidden when idle, appears when processing starts
- **Explicit reset after cancel** — After cancel, shows cancelled state; user must click "Reset" or "New Process" to continue

### Progress feedback
- **Inline section** — Progress display appears below Process button, stays in page layout (not modal or separate page)
- **Bar + current file** — Animated striped progress bar with percentage, plus current EPUB filename below it
- **Animated striped bar** — Progress bar uses striped animation style (not solid or shimmer)
- **Becomes summary card on completion** — Progress section transforms into results summary card when processing finishes

### Claude's Discretion
- Exact spacing and typography for chips and labels
- Color scheme for selected vs unselected states
- Animation timing for zone expansion and progress stripes
- Summary card content and layout (beyond "showing completion")

</decisions>

<specifics>
## Specific Ideas

No specific references provided — open to standard shadcn/ui component patterns for chips, toasts, and progress bars.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-file-upload-tokenizer-selection*
*Context gathered: 2026-01-23*
