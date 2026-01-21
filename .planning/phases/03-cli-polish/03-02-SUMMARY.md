---
phase: 03-cli-polish
plan: 02
subsystem: error-handling
tags: [severity-logging, error-handling, typescript, fs-module]

# Dependency graph
requires:
  - phase: 02-tokenization-engine
    provides: processEpubsWithErrors with basic error handling
provides:
  - Severity-based error logging with FATAL/ERROR/WARN levels
  - Dual output: Console (moderately intrusive) + errors.log file (persistent)
  - Error classification with suggestions for common failure scenarios
affects: [03-03-progress-bars, 03-04-parallel-processing]

# Tech tracking
tech-stack:
  added: []
  patterns: [severity-based error logging, error classification, dual console/file output]

key-files:
  created: [src/errors/logger.ts]
  modified: [src/errors/handler.ts, src/cli/index.ts]

key-decisions:
  - "FATAL errors stop processing immediately (exit code 1)"
  - "ERROR errors pause 500ms for visibility, then continue"
  - "WARN errors use console.warn without pause"
  - "errors.log format: [timestamp] [SEVERITY] file: error Suggestion: suggestion"

patterns-established:
  - "Severity enum (FATAL/ERROR/WARN) following Syslog standard"
  - "Error classification function returns severity + suggestion"
  - "Logger module handles both console output (severity-based) and file output (persistent)"

# Metrics
duration: 5min
completed: 2026-01-21
---

# Phase 3: Plan 2 Summary

**Severity-based error logging with dual console/file output, error classification with suggestions, and FATAL error handling that stops processing**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-21T20:24:49Z
- **Completed:** 2026-01-21T20:30:09Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Created new logger module with ErrorSeverity enum (FATAL, ERROR, WARN)
- Implemented dual output: Console (severity-based behavior) + errors.log file (persistent)
- Error classification with suggestions for common failure scenarios (ENOENT, EACCES, EPUB parse errors, memory limit)
- FATAL errors stop processing immediately with exit code 1
- ERROR errors pause 500ms for visibility, then continue processing
- WARN errors use console.warn without pause

## Task Commits

Each task was committed atomically:

1. **Task 1: Create error logger module with severity levels** - `e3b3ce1` (feat)
2. **Task 2: Refactor handler to use new logger module** - `2274b97` (refactor)
3. **Task 3: Update CLI to handle FATAL errors properly** - `4c8ea62` (feat)

**Plan metadata:** Not yet committed

## Files Created/Modified

### Created
- `src/errors/logger.ts` - Severity-based error logging with dual console/file output, ErrorSeverity enum (FATAL/ERROR/WARN), logError function with 500ms pause for ERROR level

### Modified
- `src/errors/handler.ts` - Removed old logError function and ErrorLogEntry interface, added classifyError function, updated to use logger module, FATAL errors re-throw to stop processing
- `src/cli/index.ts` - Wrapped processEpubsWithErrors in try/catch, FATAL errors exit immediately without summary, ERROR/WARN errors continue to summary display

## Decisions Made

1. **FATAL errors stop processing immediately** - Memory limit errors and similar catastrophic issues require user intervention, so processing stops with exit code 1
2. **ERROR errors pause 500ms for visibility** - Corrupted EPUBs and file-level errors need user attention but shouldn't stop batch processing; brief pause ensures visibility
3. **WARN errors use console.warn without pause** - Partial results and informational issues don't need to interrupt flow
4. **Error classification in handler.ts** - classifyError function maps error codes/messages to severity levels and suggestions, keeping logger module generic
5. **errors.log format includes timestamp, severity, file, error, suggestion** - ISO 8601 timestamp, severity level in brackets, filename, error message, optional suggestion

## Deviations from Plan

None - plan executed exactly as written.

## Verification

Tested with:
- Malformed EPUB file → ERROR severity logged, processing continued, errors.log created with correct format
- Multiple EPUBs (including malformed) → ERROR displayed with 500ms pause, other files processed successfully
- errors.log format: `[2026-01-21T20:29:00.811Z] [ERROR] epubs/malformed.epub: Failed to parse EPUB file 'epubs/malformed.epub': Cannot read properties of undefined (reading '0') Suggestion: File may be corrupted or not a valid EPUB.`

## Issues Encountered

None - all tasks completed as planned.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Severity-based error logging is complete and ready for integration with:
- Plan 03-03 (Progress bars): Error logging won't interfere with progress bar output
- Plan 03-04 (Parallel processing): FATAL error handling will properly stop parallel jobs

**Blockers/Concerns:** None

---
*Phase: 03-cli-polish*
*Completed: 2026-01-21*
