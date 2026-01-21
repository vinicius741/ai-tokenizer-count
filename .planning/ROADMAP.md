# Roadmap: EPUB Tokenizer Counter

## Overview

A three-phase journey from basic EPUB processing to a production-ready CLI tool. We start with EPUB parsing and text extraction, add tokenization with multiple tokenizer models and JSON output, and finish with CLI polish including progress indicators, error handling, and parallel processing.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: EPUB Foundation** - Parse EPUBs, extract text and metadata, basic CLI structure
- [x] **Phase 2: Tokenization Engine** - Token counting with multiple models and JSON output
- [ ] **Phase 3: CLI Polish** - Progress indicators, error handling, parallel processing

## Phase Details

### Phase 1: EPUB Foundation

**Goal**: Users can process EPUB files and extract word counts with rich metadata via a functional CLI.

**Depends on**: Nothing (first phase)

**Requirements**: EPUB-01, EPUB-02, EPUB-03, EPUB-04, EPUB-05, EPUB-06, TOKEN-05, CLI-04, CLI-05, CFG-01, CFG-02, CFG-03, CFG-04, OUT-04

**Success Criteria** (what must be TRUE):
1. User can run `epub-counter` to process all EPUBs in `./epubs/` folder or specific EPUBs by filename
2. User receives word count for each processed EPUB with extracted metadata (title, author, language, publisher)
3. Tool handles malformed EPUBs gracefully without crashing, logging errors and continuing to process remaining files
4. User can specify custom input/output folders via CLI arguments (`--input`, `--output`)
5. Help text documents all CLI arguments and options clearly

**Plans**: 5 plans

Plans:
- [x] 01-01-PLAN.md — Project scaffolding, TypeScript setup, and EPUB file discovery scanner
- [x] 01-02-PLAN.md — EPUB parsing wrapper, metadata extraction, and word counting
- [x] 01-03-PLAN.md — CLI interface with commander and table output with cli-table3
- [x] 01-04-PLAN.md — Error handling, continue-on-error logic, and results.md generation
- [x] 01-05-PLAN.md — End-to-end testing and validation

**Completed:** 2026-01-21

### Phase 2: Tokenization Engine

**Goal**: Users can tokenize EPUB content using multiple tokenizer models (GPT-4, Claude, custom) and receive JSON output with token counts.

**Depends on**: Phase 1 (EPUB Foundation)

**Requirements**: TOKEN-01, TOKEN-02, TOKEN-03, TOKEN-04, TOKEN-06, OUT-01, OUT-02, OUT-03, OUT-05, OUT-06, OUT-07, OUT-08

**Success Criteria** (what must be TRUE):
1. User can tokenize EPUB text using GPT-4 preset tokenizer (cl100k_base or latest)
2. User can tokenize EPUB text using Claude preset tokenizer (latest Anthropic tokenizer)
3. User can specify any Hugging Face tokenizer by name/path via CLI argument
4. Tool outputs one JSON file per EPUB containing title, word_count, token_counts (per tokenizer), file_path, processed_at, and epub_metadata
5. Token counts are accurate for each selected tokenizer model

**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Foundation & dependencies (tokenizer libraries, types, and factory)
- [x] 02-02-PLAN.md — Core tokenizer implementations (GPT-4, Claude, Hugging Face)
- [x] 02-03-PLAN.md — CLI integration & JSON output (--tokenizers flag, token_counts array, schema_version)
- [x] 02-04-PLAN.md — Processing & memory management (pipeline integration, --max-mb flag, Claude 3+ warning)

**Completed:** 2026-01-21

### Phase 3: CLI Polish

**Goal**: Users get professional CLI experience with progress feedback, robust error handling, and fast parallel processing.

**Depends on**: Phase 2 (Tokenization Engine)

**Requirements**: CLI-01, CLI-02, CLI-03, CLI-06, OUT-09

**Success Criteria** (what must be TRUE):
1. User sees progress indicators during processing (X of Y for batch, spinner for individual files)
2. User sees detailed error information both in console and `errors.log` file
3. Tool continues processing remaining EPUBs when one file fails, displaying summary of failures
4. User can enable parallel processing via `--jobs` flag to speed up batch operations
5. Tool displays summary statistics after batch completion (total EPUBs processed, total tokens per tokenizer, averages)

**Plans**: TBD

Plans:
- [ ] 03-01: Progress indicators (indicatif integration, multi-progress for parallel jobs)
- [ ] 03-02: Error logging system (dual console/file logging, error classification)
- [ ] 03-03: Parallel processing with rayon (--jobs flag, work-stealing thread pool)
- [ ] 03-04: Summary statistics display (aggregation, formatting)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. EPUB Foundation | 5/5 | Complete | 2026-01-21 |
| 2. Tokenization Engine | 4/4 | Complete | 2026-01-21 |
| 3. CLI Polish | 0/4 | Not started | - |

**Overall Progress:** 9/13 plans complete (69%)
