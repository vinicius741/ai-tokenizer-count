# Requirements: EPUB Tokenizer Counter

**Defined:** 2026-01-21
**Core Value:** Users can accurately estimate token costs for processing EPUB content through LLMs by getting precise word and token counts across multiple tokenizer models.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### EPUB Processing

- [x] **EPUB-01**: Tool can process all EPUB files in a specified folder (batch mode)
- [x] **EPUB-02**: Tool can process specific EPUB files specified by command-line arguments
- [x] **EPUB-03**: Tool supports EPUB 2.0.1 and 3.0 format specifications
- [x] **EPUB-04**: Tool extracts readable text content from EPUB files (excluding frontmatter/backmatter where possible)
- [x] **EPUB-05**: Tool extracts rich metadata from EPUB (title, author, language, publisher)
- [x] **EPUB-06**: Tool handles malformed EPUB files gracefully without crashing (continue-on-error)

### Tokenization

- [x] **TOKEN-01**: Tool provides preset tokenizers from major AI labs (latest models as of implementation time)
- [x] **TOKEN-02**: Tool includes GPT-4 tokenizer preset (cl100k_base or latest)
- [x] **TOKEN-03**: Tool includes Claude tokenizer preset (latest Anthropic tokenizer)
- [x] **TOKEN-04**: Tool allows users to specify any Hugging Face tokenizer by name/path
- [x] **TOKEN-05**: Tool counts words accurately from extracted EPUB text
- [x] **TOKEN-06**: Tool counts tokens accurately for each selected tokenizer

### CLI Experience

- [ ] **CLI-01**: Tool shows progress indicators during processing (X of Y for batch, spinner for individual files)
- [x] **CLI-02**: Tool logs detailed error information to both console and `errors.log` file
- [x] **CLI-03**: Tool continues processing remaining EPUBs when one file fails
- [x] **CLI-04**: Tool allows users to specify custom input folder path via CLI argument
- [x] **CLI-05**: Tool allows users to specify custom output folder path via CLI argument
- [ ] **CLI-06**: Tool supports parallel processing of multiple EPUBs via `--jobs` flag

### Output

- [x] **OUT-01**: Tool outputs results in JSON format
- [x] **OUT-02**: Tool creates one JSON file per EPUB (atomic output)
- [x] **OUT-03**: JSON output includes title (from EPUB metadata)
- [x] **OUT-04**: JSON output includes word_count (total words in EPUB)
- [x] **OUT-05**: JSON output includes token_counts (object with counts per tokenizer)
- [x] **OUT-06**: JSON output includes file_path (path to processed EPUB)
- [x] **OUT-07**: JSON output includes processed_at (ISO 8601 timestamp)
- [x] **OUT-08**: JSON output includes epub_metadata (extracted metadata: author, language, publisher)
- [ ] **OUT-09**: Tool displays summary statistics after batch completion (total EPUBs processed, total tokens, averages)

### Configuration

- [x] **CFG-01**: Default input folder is `./epubs/`
- [x] **CFG-02**: Default output folder is `./results/`
- [x] **CFG-03**: `./epubs/` folder is added to .gitignore
- [x] **CFG-04**: Tool provides help text documenting all CLI arguments and options

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Performance

- **PERF-01**: Tool implements streaming/chunked tokenization for large EPUBs to manage memory usage
- **PERF-02**: Tool caches tokenizers to avoid reloading on each EPUB

### Advanced Features

- **ADV-01**: Cost estimation calculator (converts tokens to estimated API costs)
- **ADV-02**: Per-chapter token breakdown (shows counts per chapter/section)
- **ADV-03**: Diff mode (compare tokenization results between tokenizers)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| DRM handling | Legal complexity, user expectation mismatch. Tool will skip DRMed EPUBs with warning. |
| Text file export | Bloat. Users want counts, not extracted text. Dedicated tools handle text export. |
| EPUB modification | Tool is read-only analyzer. Modifying source files is dangerous. |
| Other document formats (PDF, DOCX, etc.) | EPUB only for v1. Other formats have different parsing requirements. |
| Real-time watch mode | Adds complexity and background process management. Manual execution is explicit. |
| GUI or web interface | CLI only for v1. Visual interfaces are separate concern. |
| Interactive prompts | Breaks automation. Use flags for configuration. |
| Tokenizer training/fine-tuning | Only uses existing tokenizers from Hugging Face. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EPUB-01 | Phase 1 | Complete |
| EPUB-02 | Phase 1 | Complete |
| EPUB-03 | Phase 1 | Complete |
| EPUB-04 | Phase 1 | Complete |
| EPUB-05 | Phase 1 | Complete |
| EPUB-06 | Phase 1 | Complete |
| TOKEN-01 | Phase 2 | Complete |
| TOKEN-02 | Phase 2 | Complete |
| TOKEN-03 | Phase 2 | Complete |
| TOKEN-04 | Phase 2 | Complete |
| TOKEN-05 | Phase 1 | Complete |
| TOKEN-06 | Phase 2 | Complete |
| CLI-01 | Phase 3 | Pending |
| CLI-02 | Phase 1 | Complete |
| CLI-03 | Phase 1 | Complete |
| CLI-04 | Phase 1 | Complete |
| CLI-05 | Phase 1 | Complete |
| CLI-06 | Phase 3 | Pending |
| OUT-01 | Phase 1 | Complete |
| OUT-02 | Phase 1 | Complete |
| OUT-03 | Phase 1 | Complete |
| OUT-04 | Phase 1 | Complete |
| OUT-05 | Phase 2 | Complete |
| OUT-06 | Phase 1 | Complete |
| OUT-07 | Phase 1 | Complete |
| OUT-08 | Phase 1 | Complete |
| OUT-09 | Phase 3 | Pending |
| CFG-01 | Phase 1 | Complete |
| CFG-02 | Phase 1 | Complete |
| CFG-03 | Phase 1 | Complete |
| CFG-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 31 total
- Complete: 22 (71%)
- Pending: 9 (29%)
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after Phase 2 completion*
