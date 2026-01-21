# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-21)

**Core value:** Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.
**Current focus:** Phase 2: Tokenization Engine

## Current Position

Phase: 2 of 3 (Tokenization Engine)
Plan: 1 of 4 in current phase
Status: In progress
Last activity: 2026-01-21T18:26:54Z — Completed 02-01-PLAN.md

Progress: [████░░░░░░░] 46%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 14 min
- Total execution time: 1.43 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-epub-foundation | 5 | 5 | 16 min |
| 02-tokenization-engine | 1 | 4 | 2 min (so far) |

**Recent Trend:**
- Last 5 plans: 01-01 (17 min), 01-02 (13 min), 01-03 (7 min), 01-04 (46 min), 01-05 (14 min)
- Current: 02-01 (2 min)
- Trend: Fast start to Phase 2

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

### Pending Todos

None yet.

### Blockers/Concerns

**Known limitations (not blockers):**
- CJK word counting may need refinement in later phases (currently treats CJK text as one word without spaces)
- Word counting includes all text (frontmatter/backmatter not excluded in v1)
- Hyphenated words counted as one word (standard behavior)
- npm audit reported 16 vulnerabilities in transitive dependencies (common for ML libraries, monitored)

## Session Continuity

Last session: 2026-01-21T18:25:27Z
Stopped at: Completed 02-01-PLAN.md, SUMMARY.md created, STATE.md ready for update
Resume file: None

**Phase 2 Plan 1 Complete.** Tokenizer libraries installed (js-tiktoken, @anthropic-ai/tokenizer, @huggingface/transformers), interface abstraction created with factory pattern. Ready for plans 02-02, 02-03, 02-04 to implement specific tokenizers.
