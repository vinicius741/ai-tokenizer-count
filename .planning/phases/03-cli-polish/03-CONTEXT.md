# Phase 3: CLI Polish - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Professional CLI experience layer — adding progress feedback, error handling, and parallel processing on top of existing EPUB processing and tokenization functionality. Core functionality works; this phase makes the tool feel polished and production-ready.

</domain>

<decisions>
## Implementation Decisions

### Progress presentation
- **Multi-progress bars** — Each parallel job gets its own labeled progress bar
- **Format:** "filename.epub: 45%" — compact and scannable
- Progress bar row allocation: Claude's discretion (dedicated row vs dynamic based on parallel approach)
- Overall summary bar: Claude's discretion (show both overall + individual, or individual only)

### Error experience
- **Dual output:** Console + errors.log file both
- **Severity levels:** FATAL (can't continue), ERROR (file skipped), WARN (partial results)
- **Moderately intrusive:** Pause briefly, show error inline, auto-resume after visible delay
- **errors.log format:** Actionable summary — timestamp, filename, error message, suggestion to fix (no stack trace)

### Parallel processing UX
- **Default:** Auto-detect CPU cores, use (CPU count - 1) by default
- **--jobs flag:** Accepts number or "all" keyword for max cores
- **Resource protection:** Claude's discretion (enforce --max-mb per job, or job count as sole control)
- **Soft cap:** Warn if --jobs > 32 (diminishing returns), but allow any value

### Summary format
- **Content:** Core + averages — total EPUBs, total words, total tokens (per tokenizer), failures, averages per EPUB, averages per tokenizer
- **Structure:** Claude's discretion (single table vs sectioned blocks)
- **Failures:** Include as table rows with ERROR status in main summary
- **Timing:** Detailed — total time, avg time/EPUB, fastest/slowest file

### Claude's Discretion
- Progress bar row allocation strategy for parallel jobs
- Whether to show overall summary bar alongside individual bars
- Memory protection strategy for parallel processing (per-job --max-mb vs job-count only)
- Summary visual structure (single table vs sectioned blocks)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard CLI polish approaches similar to tools like prettier, eslint, or other Node.js CLIs with parallel processing.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-cli-polish*
*Context gathered: 2026-01-21*
