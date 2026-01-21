# Phase 1: EPUB Foundation - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Parse EPUB files and extract word counts with rich metadata via a functional CLI. Users can process individual EPUB files or batches from folders. Tokenization and JSON output are Phase 2.

</domain>

<decisions>
## Implementation Decisions

### CLI Interface Design
- Support both positional paths and `--input` flag for flexibility
- Default input location: `./epubs/` folder
- Default output location: `./output/` (fixed, no --output flag in this phase)
- Support both single-file and batch mode (folder processing)
- Running with no arguments processes `./epubs/` with defaults
- `--verbose` / `-v` flag for detailed output (default is terse)
- `--recursive` flag to enable subdirectory scanning (default is flat scan)

### Output Format
- Table format with 4 columns: filename, word count, title, author
- Save `results.md` summary file in output folder
- Terminal shows table during/after processing

### File Discovery Behavior
- Flat scan by default, `--recursive` flag for subdirectory scan
- Only recognize files ending in `.epub` (case-insensitive)
- **Claude's Discretion:** Hidden files and hidden folders handling

### Error Handling Philosophy
- Continue on error: log and process remaining files
- Log to both stderr and `errors.log` in output folder
- Show helpful error info: file path, error message, suggestion if possible
- Display error summary after completion: total processed, successful, failed

### Claude's Discretion
- Hidden files/folders handling (skip or include)
- Exact table formatting and column widths
- Error suggestion messages content
- results.md file structure and format

</decisions>

<specifics>
## Specific Ideas

No specific requirements or product references provided — open to standard CLI best practices.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-epub-foundation*
*Context gathered: 2026-01-21*
