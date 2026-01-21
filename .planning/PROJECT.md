# EPUB Tokenizer Counter

## What This Is

A command-line interface tool that analyzes EPUB files to count words and estimate tokens using Hugging Face tokenizers. Users place EPUB files in an input folder, run the tool with their choice of tokenizers, and receive JSON output files with word counts, token counts, and metadata for each EPUB.

## Core Value

Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] CLI can process all EPUBs in a folder or specific EPUBs by filename
- [ ] Word count extracted from each EPUB
- [ ] Token count using GPT-4 tokenizer (cl100k_base)
- [ ] Token count using Claude tokenizer
- [ ] Support for custom Hugging Face tokenizer specification
- [ ] JSON output per EPUB with rich metadata (title, word_count, token_counts, file_path, processed_at, epub_metadata)
- [ ] Default input folder: `./epubs/` (configurable via CLI arg)
- [ ] Default output folder: `./results/` (configurable via CLI arg)
- [ ] `./epubs/` folder in .gitignore
- [ ] Progress indicators shown during processing
- [ ] Errors logged to both console and `errors.log` file
- [ ] Processing continues on error (skips problematic EPUBs)

### Out of Scope

- EPUB editing or modification — tool is read-only
- Other document formats (PDF, DOCX, etc.) — EPUB only for v1
- Tokenizer training or fine-tuning — only uses existing tokenizers
- GUI or web interface — CLI only
- Real-time processing as EPUBs are added — manual execution only

## Context

**Tokenization context:** Different LLM providers use different tokenizers. GPT-4 uses cl100k_base, Claude uses its own tokenizer. Token count affects API costs and context window limits. Users need accurate counts to estimate processing costs.

**EPUB format:** EPUB is a ZIP-based format containing HTML/XHTML content. Text extraction requires parsing the EPUB structure and extracting readable text from content documents.

**User workflow:** User has a collection of EPUBs (books, documents) and wants to know how many tokens they would consume if processed by various LLMs before committing to API usage.

## Constraints

- **Tokenizers**: Must use Hugging Face tokenizers library — industry standard, wide model support
- **Language**: Rust preferred for CLI performance and single-binary distribution
- **EPUB parsing**: Must handle standard EPUB 2.0 and 3.0 formats
- **Error handling**: Tool must not crash on single EPUB failure — process all valid files
- **Output**: One JSON file per EPUB (not combined)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rust language | CLI performance, single binary, good Hugging Face bindings | — Pending |
| Separate JSON per EPUB | Easier to process individual results, atomic writes | — Pending |
| GPT-4 + Claude presets | Most common LLM providers, covers 80%+ of use cases | — Pending |
| Rich metadata output | Users need context for each result (when processed, which file) | — Pending |
| Continue-on-error behavior | Large EPUB collections shouldn't fail completely due to one bad file | — Pending |

---
*Last updated: 2026-01-21 after initialization*
