---
phase: 06-file-upload-tokenizer-selection
plan: 02
subsystem: Frontend File Upload
tags:
  - react
  - file-upload
  - drag-drop
  - schema-validation
  - toast-notifications
  - shadcn-ui

dependency_graph:
  requires:
    - phase: "05-05"
      plan: "Backend API - Upload Results"
      reason: "Schema validation matches server-side ResultsOutput type"
  provides:
    - "File upload UI with drag-drop zone for results.json files"
    - "Frontend schema validator for ResultsOutput data"
    - "File chip component for compact file display"
  affects:
    - phase: "06-03"
      plan: "Results Table"
      reason: "File upload provides data for results table display"

tech_stack:
  added: []
  patterns:
    - "HTML5 Drag-and-Drop API with visual state feedback"
    - "Manual schema validation (no external validator libraries)"
    - "Sonner toast notifications for user feedback"
    - "Compact UI pattern (dropzone expands/shrinks based on state)"

key_files:
  created:
    - path: "web/src/lib/schema-validator.ts"
      lines: 97
      description: "Frontend validator for ResultsOutput schema v1.0"
    - path: "web/src/components/file-upload/FileChip.tsx"
      lines: 25
      description: "Compact file display badge with remove button"
    - path: "web/src/components/file-upload/FileDropzone.tsx"
      lines: 95
      description: "Drag-drop file upload zone with validation"
  modified:
    - path: "web/src/components/ui/badge.tsx"
      change: "Added variant='secondary' with gap-2 flex layout"
    - path: "web/src/App.tsx"
      change: "Added test page for FileDropzone component"

decisions_made:
  - decision: "Manual schema validation without ajv/zod"
    rationale: "Matches backend approach (05-05), keeps frontend lightweight, ResultsOutput schema is stable"
    impact: "Faster initial page load, no additional dependencies"

  - decision: "Scale animation (scale-[1.02]) for drag feedback"
    rationale: "Subtle but clear visual cue when dragging file over zone"
    impact: "Improved UX with minimal CSS complexity"

  - decision: "File chip pattern (expand zone -> shrink to chip)"
    rationale: "Space-efficient UI, clear indication of loaded state"
    impact: "Clean UI that maximizes content area after file load"

metrics:
  duration: "PT15M"
  started: "2026-01-23T19:30Z"
  completed: "2026-01-23T19:45Z"
  tasks_completed: 3
  commits: 3
  lines_added: ~250
  files_created: 3
  files_modified: 2
---

# Phase 6 Plan 02: File Upload Interface Summary

**One-liner:** Drag-drop file upload zone with JSON schema validation for results.json files using HTML5 Drag-and-Drop API and Sonner toasts.

## What Was Built

Created a complete file upload interface allowing users to load existing results.json files through drag-drop or file picker with comprehensive schema validation.

### Components Delivered

1. **Schema Validator** (`web/src/lib/schema-validator.ts`)
   - Validates ResultsOutput schema v1.0 without external dependencies
   - Checks all required fields: schemaVersion, timestamp, options, results, summary
   - Returns detailed error messages for invalid data
   - Type guard function `validateResultsOutput()` and detailed `validateResultsFile()`

2. **FileChip Component** (`web/src/components/file-upload/FileChip.tsx`)
   - Compact badge display with file icon, truncated filename, remove button
   - Uses shadcn/ui Badge and Button components
   - Maximum filename width: 200px with truncation

3. **FileDropzone Component** (`web/src/components/file-upload/FileDropzone.tsx`)
   - HTML5 Drag-and-Drop API with onDrop, onDragOver, onDragLeave events
   - Visual feedback: scale-[1.02] animation and border color changes when dragging
   - Dual input modes: drag-drop or click-to-browse file picker
   - Schema validation with error toasts showing specific validation failures
   - Success toast with EPUB count from loaded results
   - State management: expands when empty, shrinks to FileChip when file loaded

## Technical Implementation

### Drag-Drop State Management

```typescript
const [isDragging, setIsDragging] = useState(false)
const [selectedFile, setSelectedFile] = useState<{ name: string; data: ResultsOutput } | null>(null)
```

- `isDragging`: Controls visual feedback (scale animation, border color)
- `selectedFile`: Null when empty, object with file data after successful load

### Validation Flow

1. File dropped/selected → Parse as JSON
2. Schema validation → Check all required fields
3. If invalid → Show error toast with specific validation errors
4. If valid → Set selectedFile state, call onFileLoaded callback, show success toast

### Toast Notifications

- Error toasts: "Invalid results.json" with validation error list
- Success toasts: "Results loaded successfully" with EPUB count
- Auto-dismissing via Sonner library

## Deviations from Plan

### Test Page Setup (Task 0)

**Added during execution:** Setup test infrastructure in App.tsx

- **Found during:** Task 1 execution
- **Issue:** No way to verify FileDropzone functionality during development
- **Fix:** Added test page component in App.tsx rendering FileDropzone with console logging
- **Files modified:** `web/src/App.tsx`, `web/src/main.tsx`
- **Commit:** ed24034
- **Classification:** [Rule 3 - Blocking] Cannot verify without test page

## Authentication Gates

None - no authentication required for this plan.

## Verification Results

**Checkpoint approved by user** after testing all features:

- [x] Drag file over drop zone → scale animation triggers
- [x] Drop valid results.json → FileChip appears with filename
- [x] Drop invalid JSON → error toast with "Failed to parse file"
- [x] Drop valid JSON with wrong schema → validation error toast
- [x] Click drop zone → file picker opens
- [x] Select valid file → FileChip appears, success toast shows EPUB count
- [x] Click X on FileChip → chip disappears, drop zone returns
- [x] Console logs loaded ResultsOutput data

## Success Criteria Met

- [x] User can drag file over drop zone and see visual feedback (scale animation)
- [x] User can drop valid results.json and see FileChip appear
- [x] User can drop invalid JSON and see error toast
- [x] User can click drop zone to open file picker
- [x] User sees validation errors as toasts that auto-dismiss
- [x] FileChip displays filename with remove button
- [x] Clicking X removes file and shows drop zone again
- [x] Component loads ResultsOutput data and passes to parent via onFileLoaded callback

## Next Phase Readiness

**Integration ready:**

1. **06-03 Results Table** - File upload provides data for table display
2. **Parent component integration** - `onFileLoaded(data: ResultsOutput, fileName: string)` callback passes data to parent
3. **State management** - Selected file stored in component state, cleared on remove

**No blockers identified.**

## Performance Notes

- File parsing uses `File.text()` API (async, efficient for files under 10MB)
- Schema validation is synchronous O(n) where n = number of results
- No unnecessary re-renders (useCallback for event handlers)
- Toast notifications don't block UI

## Testing Notes

Sample test files created in `web/test-files/`:
- `valid-results.json` - Valid results.json with sample data
- `invalid-schema.json` - Valid JSON but wrong schema
- `invalid-json.json` - Malformed JSON for error handling

Test page accessible at `http://localhost:5173` during development.
