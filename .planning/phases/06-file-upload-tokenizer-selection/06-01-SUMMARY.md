---
phase: 06-file-upload-tokenizer-selection
plan: 01
subsystem: Frontend UI Components
tags: [react, shadcn/ui, tokenizer-selection, localstorage, ui-components]

dependency_graph:
  requires:
    - .planning/phases/05-backend-api-file-processing/05-01-SUMMARY.md
    - "@epub-counter/shared package with TokenizerInfo type"
  provides:
    - "TokenizerSelector component for tokenizer selection UI"
    - "useLocalStorage hook for state persistence"
    - "shadcn/ui components (toggle-group, command, popover, hover-card, sonner)"
  affects:
    - "06-02: File Upload UI (will use similar patterns)"
    - "06-04: Processing Progress (will use Sonner for toasts)"

tech_stack:
  added:
    - "@microsoft/fetch-event-source (for SSE in 06-04)"
    - "shadcn/ui: sonner, toggle-group, command, popover, hover-card, badge, dialog"
  patterns:
    - "Custom React hooks (useLocalStorage)"
    - "shadcn/ui ToggleGroup for multi-select chips"
    - "Popover + Command composition for searchable dropdowns"
    - "HoverCard for contextual info display"
    - "localStorage persistence for user preferences"

key_files:
  created:
    - path: "web/src/hooks/use-local-storage.ts"
      lines: 35
      purpose: "Custom localStorage hook with error handling and SSR safety"
    - path: "web/src/components/tokenizer/ModelInfoCard.tsx"
      lines: 38
      purpose: "Hover card content displaying HF model details"
    - path: "web/src/components/tokenizer/HFModelCombobox.tsx"
      lines: 87
      purpose: "Searchable multi-select dropdown for HF models"
    - path: "web/src/components/tokenizer/TokenizerSelector.tsx"
      lines: 141
      purpose: "Main tokenizer selection component with ToggleGroup and localStorage"
    - path: "web/src/components/ui/sonner.tsx"
      lines: 4
      purpose: "shadcn/ui Sonner component for toast notifications"
    - path: "web/src/components/ui/toggle-group.tsx"
      lines: 74
      purpose: "shadcn/ui ToggleGroup for multi-select toggle chips"
    - path: "web/src/components/ui/command.tsx"
      lines: 144
      purpose: "shadcn/ui Command for searchable dropdowns"
    - path: "web/src/components/ui/popover.tsx"
      lines: 79
      purpose: "shadcn/ui Popover for dropdown containers"
    - path: "web/src/components/ui/hover-card.tsx"
      lines: 77
      purpose: "shadcn/ui HoverCard for hover-triggered info cards"
    - path: "web/src/components/ui/badge.tsx"
      lines: 39
      purpose: "shadcn/ui Badge for displaying selected items"
    - path: "web/src/components/ui/dialog.tsx"
      lines: 75
      purpose: "shadcn/ui Dialog for modal interactions"
  modified:
    - path: "web/package.json"
      changes: "Added @microsoft/fetch-event-source dependency"
    - path: "web/src/main.tsx"
      changes: "Added Toaster component for Sonner support"

decisions_made:
  - title: "ToggleGroup for tokenizer chips"
    rationale: "ToggleGroup provides built-in multi-select state management and accessibility"
    outcome: "GPT-4 and Claude use ToggleGroupItem chips with visual toggle feedback"
  - title: "Sonner for toast notifications"
    rationale: "shadcn/ui officially deprecated toast component in Feb 2025; Sonner is the replacement"
    outcome: "Toaster component added to main.tsx for global toast support"
  - title: "Separate HF model combobox"
    rationale: "Hugging Face models list is too large for chips; searchable dropdown is better UX"
    outcome: "HFModelCombobox with Command search and HoverCard info cards"
  - title: "localStorage for tokenizer persistence"
    rationale: "Users expect their selections to be remembered across sessions"
    outcome: "useLocalStorage hook with 'selected-tokenizers' key and ['gpt4', 'claude'] default"

deviations_from_plan:
  auto_fixed: []
  authentication_gates: []

metrics:
  duration: "25 minutes"
  completed: "2026-01-23"
  tasks_completed: 6
  commits_created: 6
  files_created: 11
  files_modified: 2

---

# Phase 6 Plan 1: Tokenizer Selector UI Summary

## One-Liner

Multi-select tokenizer interface with ToggleGroup chips for GPT-4/Claude, searchable Hugging Face model combobox with hover info cards, and localStorage persistence.

## What Was Built

**Core tokenizer selection UI** enabling users to choose GPT-4, Claude, and Hugging Face tokenizers through an intuitive interface that remembers preferences across sessions.

### Component Hierarchy

```
TokenizerSelector (main container)
|-- useLocalStorage hook (persistence)
|-- ToggleGroup (GPT-4, Claude chips)
|-- HFModelCombobox (searchable HF dropdown)
|   |-- Popover + Command (search interface)
|   |-- HoverCard (model info on hover)
|   |-- ModelInfoCard (info card content)
|-- Badge list (selected HF models with remove buttons)
|-- Validation message (error when empty)
```

### Key Features Delivered

| Feature | Implementation |
|---------|---------------|
| **GPT-4/Claude chips** | ToggleGroup with ToggleGroupItem for visual toggle state |
| **HF model search** | Combobox pattern (Popover + Command) with keyboard navigation |
| **Model info on hover** | HoverCard wrapping CommandItem, displaying ModelInfoCard |
| **Selected HF badges** | Badge components with X button to remove selection |
| **LocalStorage persistence** | useLocalStorage hook with 'selected-tokenizers' key |
| **Validation** | Error message shown when no tokenizers selected |
| **API integration** | Fetches from GET /api/list-models on mount |
| **Parent callback** | onSelectionChange prop notifies parent of changes |

### Technical Implementation

**useLocalStorage Hook** (`web/src/hooks/use-local-storage.ts`)
- SSR-safe (returns initialValue when window is undefined)
- Try/catch for JSON parsing errors with console error logging
- Returns `[storedValue, setValue]` const tuple
- Supports functional updates (`setValue(prev => [...prev, newItem])`)

**ModelInfoCard** (`web/src/components/tokenizer/ModelInfoCard.tsx`)
- Displays model name with async badge
- Shows description in muted text
- Links to Hugging Face model card for HF models
- Uses Badge component for async indicator

**HFModelCombobox** (`web/src/components/tokenizer/HFModelCombobox.tsx`)
- Multi-select with checkmark indicators
- Command search filters by both ID and name
- HoverCard trigger on CommandItem for model info
- Selected count displayed in trigger button
- Toggle model selection (add/remove)

**TokenizerSelector** (`web/src/components/tokenizer/TokenizerSelector.tsx`)
- Standard tokenizers (GPT-4, Claude) in ToggleGroup
- HF models in separate HFModelCombobox section
- Selected HF models displayed as removable badges
- Validation error when no tokenizers selected
- Summary showing count of selected tokenizers
- Fetches models from API with error handling
- Calls onSelectionChange on selection updates

### shadcn/ui Components Installed

| Component | Purpose |
|-----------|---------|
| **sonner** | Toast notifications (replaces deprecated toast) |
| **toggle-group** | Multi-select toggle chips for GPT-4/Claude |
| **command** | Searchable command palette for HF models |
| **popover** | Dropdown container for combobox |
| **hover-card** | Hover-triggered info cards |
| **badge** | Selected item indicators |
| **dialog** | Modal interactions (installed for future use) |

## Deviations from Plan

**None** - plan executed exactly as written.

## Verification Results

All verification criteria met:

- [x] GPT-4 and Claude chips are clickable and toggle on/off
- [x] Hugging Face dropdown opens and shows searchable list
- [x] Typing in search filters the HF model list
- [x] Hovering over HF models shows info card with details
- [x] Selecting HF models adds them as badges below
- [x] Clicking X on HF badges removes them
- [x] "Please select at least one tokenizer" appears when none selected
- [x] Refreshing the page remembers selections (localStorage)
- [x] Console shows no errors
- [x] 'selected-tokenizers' key saved to browser localStorage

## Next Phase Readiness

**Complete for tokenizer selection.** Ready for 06-02 (File Upload UI) which will use similar patterns:
- Sonner for error toasts
- Badge for file display
- HoverCard for file info (potentially)

**Dependencies for next plan:**
- None - 06-02 is independent but will reuse installed shadcn/ui components

**Future plans building on this:**
- 06-04 (Processing Progress) will use Sonner for error toasts
- TokenizerSelector will be integrated into main App.tsx in later plans

## Commits

| Hash | Message | Files |
|------|---------|-------|
| a05b162 | feat(06-01): install shadcn/ui components and dependencies | package.json, main.tsx, UI components |
| 7021c78 | feat(06-01): create useLocalStorage hook | use-local-storage.ts |
| 26a3ba6 | feat(06-01): create ModelInfoCard component | ModelInfoCard.tsx |
| cd6690d | feat(06-01): create HFModelCombobox component | HFModelCombobox.tsx |
| 747c9c1 | feat(06-01): create TokenizerSelector component | TokenizerSelector.tsx |
| bdacbd2 | feat(06-01): add TokenizerSelector test to App.tsx | App.tsx |

---

*Phase: 06-file-upload-tokenizer-selection*
*Plan: 06-01*
*Completed: 2026-01-23*
*Execution time: 25 minutes*
