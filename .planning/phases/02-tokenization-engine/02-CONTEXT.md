# Phase 2: Tokenization Engine - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

## Phase Boundary

Multi-model tokenization of EPUB content. Users can tokenize extracted text using GPT-4, Claude, or custom Hugging Face tokenizers, and receive JSON output with token counts alongside existing metadata. This phase adds tokenization capability to the existing EPUB foundation — not new parsing, not CLI polish.

## Implementation Decisions

### Preset tokenizers
- Short flag invocation: `--tokenizer gpt4` (not `cl100k_base`)
- Multiple tokenizers in one pass: `--tokenizer gpt4,claude` runs both and outputs all counts
- Default GPT-4 preset: Claude's discretion (choose most widely-adopted)
- Model versioning: Claude's discretion (balance stability with staying current)

### Custom tokenizer support
- CLI pattern: Claude's discretion (choose most intuitive pattern)
- Invalid tokenizer: Fail fast with clear error message
- Validation timing: Claude's discretion (pre-validate vs lazy)
- Local files: No, remote only (Hugging Face hub model names only)

### JSON output structure
- One file per EPUB (not one file per tokenizer)
- Structure: Array of tokenizer results
  ```json
  {"tokenizers": [{"name": "gpt4", "count": 1234}, {"name": "claude", "count": 1500}]}
  ```
- Metadata: Include all metadata (title, author, publisher, language, file stats)
- Schema version: Yes, explicit `"schema_version": "1.0"` field

### Large file handling
- Processing strategy: Claude's discretion (full vs chunked based on typical EPUB sizes)
- Memory limit: Configurable via `--max-mb` flag (default: 500MB)
- On limit exceeded: Skip EPUB, log error, continue processing others
- Progress indicator: Yes, percentage-based for large files

### Claude's Discretion
- Default GPT-4 tokenizer choice (cl100k_base vs o200k_base)
- Model update strategy (alias to latest vs version pinning)
- Custom tokenizer CLI syntax
- Tokenizer validation approach (pre-validate vs lazy)
- Text processing strategy (full load vs chunked streaming)

## Specific Ideas

- None discussed — open to standard approaches

## Deferred Ideas

- None — discussion stayed within phase scope

---

*Phase: 02-tokenization-engine*
*Context gathered: 2026-01-21*
