# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-21)

**Core value:** Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.
**Current focus:** Phase 3: CLI Polish

## Current Position

Phase: 3 of 3 (CLI Polish) — COMPLETE
Plan: 4 of 4 in current phase
Status: Phase complete, verified
Last activity: 2026-01-21 — Phase 3 completed and verified

Progress: [████████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 13
- Average duration: 10 min
- Total execution time: 2.12 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-epub-foundation | 5 | 5 | 16 min |
| 02-tokenization-engine | 4 | 4 | 7 min |
| 03-cli-polish | 4 | 4 | 6 min |

**Recent Trend:**
- Last 5 plans: 02-04 (9 min), 03-01 (8 min), 03-02 (5 min), 03-03 (5 min), 03-04 (2 min)
- Trend: Phase 3 completed efficiently; CLI polish features delivered

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

1. **Used Node.js fs.readdir with recursive option** (01-01) - Efficient directory scanning without manual recursion
2. **Default to skipping hidden files/folders** (01-01) - Files starting with . are excluded by default for cleaner user experience
3. **Case-insensitive .epub extension matching** (01-01) - Catches files like "BOOK.EPUB" or "Book.Epub"
4. **@gxl/epub-parser uses named exports** (01-02) - Must use `import { parseEpub }` not default import
5. **CJK characters treated as valid word characters** (01-02) - CJK text without spaces counted as one word
6. **toMarkdown() preferred over manual HTML parsing** (01-02) - Avoids HTML tag contamination in word counts
7. **Default metadata values for missing fields** (01-02) - 'Unknown Title' and 'Unknown Author' for required fields
8. **TypeScript with ES2022 target** (01-02) - NodeNext module resolution for ESM compatibility
9. **Used commander for CLI parsing** (01-03) - Industry standard, expressive API, good documentation
10. **Used cli-table3 for formatted output** (01-03) - Active maintenance, TypeScript support, word wrapping
11. **Positional [paths...] argument for intuitive input** (01-03) - More intuitive than requiring --input for common cases
12. **Input precedence: --input > positional > default** (01-03) - Prevents conflicts between input sources
13. **Default input: ./epubs/, default output: ./results/** (01-03) - CFG-02 requirement
14. **Extended EpubResult interface with optional fields** (01-04) - Added file_path, language, publisher for JSON output while maintaining table display compatibility
15. **Used Partial<> for options interfaces** (01-04) - Allows flexible API (defaults or custom options) for writeResultsFile/writeJsonFile
16. **Error suggestion generation based on error codes** (01-04) - Helpful suggestions for ENOENT, EACCES, parse errors
17. **Separate output modules for each format** (01-04) - JSON and markdown in separate modules for reusability
18. **Created minimal valid EPUB test fixtures** (01-05) - Enables comprehensive testing without external dependencies
19. **Fixed metadata extraction to use epubInfo directly** (01-05) - @gxl/epub-parser returns info object directly, not nested in .info property
20. **Fixed text extraction to handle toMarkdown() return type** (01-05) - toMarkdown() returns string directly, not object with textContent property
21. **Used short preset names (gpt4, claude)** (02-01) - Per CONTEXT.md decision for better UX vs technical encoding names
22. **Factory pattern for tokenizer creation** (02-01) - createTokenizer function abstracts tokenizer instantiation, stub throws until implementation
23. **Tokenizer interface supports sync/async countTokens** (02-01) - Accommodates both synchronous (GPT-4, Claude) and asynchronous (Hugging Face) tokenizer APIs
24. **js-tiktoken uses camelCase encodingForModel** (02-02) - JS library uses different naming than Python tiktoken (encoding_for_model)
25. **js-tiktoken manages WASM memory via GC** (02-02) - No manual .free() method needed; dispose() only clears reference
26. **Claude 3+ token counts are approximations** (02-02) - Official @anthropic-ai/tokenizer package is inaccurate for Claude 3+, should use API usage field for accurate counts
27. **Default tokenizer is 'gpt4'** (02-03) - Most widely-adopted, chosen per CONTEXT.md discretion
28. **Tokenizer name format: presets and Hugging Face** (02-03) - Short names (gpt4, claude) for presets, "hf:model-name" for Hugging Face models
29. **token_counts is optional in JSON output** (02-03) - Field only appears when tokenization is wired in plan 02-04, maintaining backward compatibility
30. **schema_version set to '1.0'** (02-03) - Provides output format versioning for future changes
31. **Return count: -1 for failed tokenizers** (02-04) - Distinguishes tokenization errors from legitimate zero-token results, allows partial results
32. **Display Claude warning at tokenizer creation time** (02-04) - Warning appears once when tokenizers are created, not per EPUB, more efficient
33. **Memory check throws error rather than skipping** (02-04) - Explicit error forces user to acknowledge size issue, provides clear guidance
34. **Verbose output includes token counts per EPUB** (02-04) - Format: "filename: 55 words (gpt4=65, claude=70)" for immediate feedback
35. **Sequential progress display at CLI level** (03-01) - Keep errors/handler.ts independent and testable, add progress tracking at CLI level only
36. **Disable verbose mode during progress** (03-01) - Set verbose=false during progress bar operation to avoid console output contamination
37. **Dynamic progress bar creation** (03-01) - Bars created as jobs start, not all upfront; critical for parallel processing in plan 03-03
38. **Progress bar format: {bar} | {filename} | {value}/{total}** (03-01) - Clear visual feedback showing which file is processing and progress percentage
39. **clearOnComplete: false for progress bars** (03-01) - Keep completed bars visible so users can verify all files were processed
40. **cli-progress MultiBar for parallel support** (03-01) - Using MultiBar instead of single Bar enables multiple simultaneous progress bars
41. **Sectioned summary blocks: Overview, Tokenizer Stats, Failures** (03-04) - As recommended in RESEARCH.md for organized statistics display
42. **Emoji section headers for summary tables** (03-04) - 📊 Overview, 🔢 Tokenizer Statistics, ❌ Failures for visual clarity
43. **Number formatting with locale strings** (03-04) - Use toLocaleString() for readable numbers (1,234,567)
44. **Duration formatting for human readability** (03-04) - Format milliseconds as 123ms, 5.2s, or 1m 23.4s
45. **Conditional summary table display** (03-04) - Tokenizer table only shows if used, failures table only if errors exist
46. **Red header for failures table** (03-04) - Error indication using red color in cli-table3
47. **Skip -1 token counts in averages** (03-04) - Exclude error counts (-1) when calculating tokenizer averages
48. **Summary replaces verbose failed files listing** (03-04) - Failures now shown in professional table instead of verbose console.log
49. **Used p-limit instead of worker_threads** (03-03) - EPUB processing is I/O-bound (file reading, parsing), not CPU-bound. p-limit is simpler and more appropriate for async I/O operations.
50. **CPU-aware default: (CPU count - 1)** (03-03) - Leaves one core free for system processes, preventing resource exhaustion. Fallback to 1 if os.cpus() returns undefined/empty (containers/CI).
51. **Dynamic progress bar creation for parallel jobs** (03-03) - Bars created within each parallel job (not upfront) provides better UX for large batches and is essential for parallel workflows.
52. **Sequential fallback for --jobs 1** (03-03) - For --jobs 1 or single file, use existing sequential loop. Enables easy debugging and consistent behavior.
53. **Warning for job counts > 32** (03-03) - Warn user about unusually high job counts that may cause diminishing returns or memory issues.

### Pending Todos

None yet.

### Blockers/Concerns

**Known limitations (not blockers):**
- CJK word counting may need refinement in later phases (currently treats CJK text as one word without spaces)
- Word counting includes all text (frontmatter/backmatter not excluded in v1)
- Hyphenated words counted as one word (standard behavior)
- npm audit reported 16 vulnerabilities in transitive dependencies (common for ML libraries, monitored)
- Claude 3+ tokenizer counts are approximations only (not publicly documented)

## Session Continuity

Last session: 2026-01-21
Stopped at: Phase 3 complete and verified
Resume file: None

**Milestone Complete.** All 3 phases executed and verified. v1.0 roadmap complete with 13/13 plans delivered, 21/21 must-haves verified, 25/25 requirements complete. Ready for milestone audit or completion.
