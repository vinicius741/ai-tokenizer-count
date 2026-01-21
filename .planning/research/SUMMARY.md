# Project Research Summary

**Project:** EPUB Tokenizer Counter
**Domain:** CLI tool for EPUB processing and LLM tokenization
**Researched:** 2026-01-21
**Confidence:** HIGH

## Executive Summary

This is a CLI tool for analyzing EPUB ebook files and counting tokens using various LLM tokenizers (GPT-4, Claude, custom Hugging Face models). The recommended approach follows Rust's CLI best practices: a pipeline architecture where EPUBs flow through discrete stages (discovery → parsing → extraction → tokenization → output), using the `epub` crate for ZIP parsing and Hugging Face's `tokenizers` crate for accurate token counting. The stack is mature and well-documented, with Rust providing memory safety, single-binary distribution, and excellent parallel processing via `rayon`.

The key risk is handling malformed real-world EPUBs: research shows that common issues like spine ID mismatches, encoding problems, and malformed XHTML affect a significant percentage of EPUBs in the wild. Mitigation requires robust error handling with continue-on-error behavior, per-file error isolation, and comprehensive error logging. Another critical concern is memory management when tokenizing large EPUBs—Hugging Face tokenizers can consume 150x input size in RAM, requiring streaming/chunked processing rather than loading entire books into memory.

## Key Findings

### Recommended Stack

**Core technologies:**
- **Rust 1.85+ (2024 Edition)** — Core language for CLI tool; provides memory safety, single-binary distribution, and zero-cost abstractions for performance-critical tokenization
- **epub 2.1.2** — EPUB file reading; most mature Rust EPUB library, handles both EPUB 2.0.1 and 3.0 formats with minimal dependencies
- **tokenizers 0.21.0 (with http feature)** — Hugging Face's official Rust implementation; supports all major tokenizer types (BPE, WordPiece, Unigram) and can load pretrained models from Hub
- **clap 4.5.53 (derive feature)** — Industry-standard CLI argument parsing; provides compile-time validation and excellent help text generation
- **anyhow 1.0** — Application-level error handling; perfect for CLI tools with context chaining via `.context()`
- **rayon 1.10+** — Data parallelism for processing multiple EPUBs concurrently; work-stealing thread pool maximizes CPU utilization
- **serde/serde_json 1.0** — JSON serialization; de facto standard with best-in-class performance (500-1000 MB/s)
- **indicatif 0.17+** — Progress bars and spinners; professional CLI experience with ETA calculation and multi-progress support

**Avoid:** Async runtimes (Tokio) for this use case—tokenization is CPU-bound, not I/O-bound, and synchronous code with rayon is simpler and more appropriate.

### Expected Features

**Must have (table stakes):**
- Batch folder processing and individual file processing — Users have collections of EPUBs; single-file mode is foundation, batch is convenience
- Multiple tokenizer support (GPT-4, Claude, custom) — Different LLM providers use different tokenizers; users compare costs across providers
- Text extraction with noise filtering — Users want accurate counts of actual content, not copyright pages; ~500 word margin of error is acceptable
- Progress indicators and error logging — Silent processing feels broken; console output scrolls away so errors.log is essential
- Continue-on-error behavior — Large collections shouldn't fail completely due to one bad file
- JSON output with rich metadata — One JSON per EPUB with file_path, processed_at, epub_metadata

**Should have (competitive):**
- Cost estimation calculator — Convert token counts to estimated API costs for major providers; makes tool actionable
- Per-chapter breakdown — Show token counts per chapter/section for context window planning
- Parallel processing with `--jobs` flag — Speed up batch operations on multi-core systems
- Summary statistics — Aggregate stats across batch (total tokens, average per EPUB, etc.)

**Defer (v2+):**
- Custom tokenizer vocabulary loading — Power user feature, not table stakes
- Batch optimization suggestions — High complexity, nice-to-have insight
- Diff mode — Compare tokenization results between different tokenizers

### Architecture Approach

The tool follows a **pipeline architecture pattern** where data flows through distinct stages: input discovery → EPUB parsing → text extraction → tokenization → output generation. Each component has single responsibility and communicates through well-defined interfaces, enabling sequential processing of each EPUB with error isolation (failures don't crash entire system). The architecture is designed for testability—each component can be unit tested in isolation—and future parallel processing (multiple EPUBs can be processed concurrently).

**Major components:**
1. **CLI Layer** — Handles user interaction via clap argument parsing, configuration building/validation, and progress reporting
2. **EPUB Processing Layer** — Core domain logic: EPUB discoverer (file system scanning), parser (ZIP extraction), text extractor (HTML → plain text), and metadata extractor
3. **Tokenization Engine** — Value-generating component: tokenizer registry (presets + custom with lazy loading), text processor (normalization), token counter (Hugging Face integration), word counter
4. **Output Layer** — JSON serializer, file writer (atomic writes), optional result aggregator
5. **Error Handling** — Cross-cutting concern: error classifier (fatal/recoverable/warning), error logger (errors.log), user error reporter

**Build order:** CLI Layer → EPUB Discovery & Metadata → Text Extraction → Tokenization Engine → Output Layer → Error Handling & Progress (polish)

### Critical Pitfalls

1. **Malformed XHTML content (Pitfall #3)** — Real-world EPUBs contain invalid XML; use lenient parsing, implement per-file error handling (log failure, skip file, continue), and track failed files in output metadata

2. **Memory exhaustion with large EPUBs (Pitfall #7)** — Hugging Face tokenizers can consume 150x input size in RAM; process EPUBs file-by-file (natural chunks), stream content rather than loading entire EPUB, implement batch tokenization with configurable batch sizes

3. **Spine ID mismatch (Pitfall #1)** — Extremely common validation error where spine idref doesn't match manifest id; validate all spine references before processing, log warnings but continue, implement defensive parsing

4. **Silent failures (Pitfall #11)** — Tool exits with 0 status but produced incomplete results; always exit non-zero if any content failed, log all failures to stderr, include files_processed vs files_total in output metadata

5. **Incorrect tokenizer selection (Pitfall #10)** — Users select wrong model leading to 20-30% cost estimation errors; provide clear model name mappings in CLI help, support multiple tokenizers per run with labeled output, document tokenizer sources and versions

## Implications for Roadmap

Based on combined research, suggested phase structure:

### Phase 1: Foundation — CLI and EPUB Parsing
**Rationale:** Establishes program structure and validates we can read EPUBs before complex processing. This phase must handle the most common pitfalls (malformed XHTML, spine mismatches) from day one—continue-on-error is non-negotiable for usability.

**Delivers:** Working CLI that can parse EPUBs, extract text, count words, and handle errors gracefully

**Addresses:**
- Batch folder processing, individual file processing (FEATURES.md)
- EPUB 2.0.1 and 3.0 support, text extraction, metadata extraction (FEATURES.md)
- Progress indicators, error logging, continue-on-error (FEATURES.md)

**Avoids:**
- Pitfall #3 (malformed XHTML) — per-file error handling from start
- Pitfall #1 (spine ID mismatch) — validate spine references
- Pitfall #11 (silent failures) — exit non-zero on errors, log to stderr

**Stack:** clap, epub, anyhow, regex

**Architecture:** CLI Layer, EPUB Processing Layer (discoverer, parser, extractor, metadata), Error Handling

### Phase 2: Tokenization Engine
**Rationale:** The primary differentiator—token counting using Hugging Face tokenizers. This is critical path; we must verify early that we can load GPT-4/Claude tokenizers from Hub and tokenize text accurately. Memory management (Pitfall #7) must be addressed here with streaming/chunked processing.

**Delivers:** CLI that tokenizes EPUB text with multiple tokenizers and produces JSON output

**Addresses:**
- Multiple tokenizer support (GPT-4, Claude presets) (FEATURES.md)
- Custom tokenizer specification (FEATURES.md)
- JSON output format with rich metadata (FEATURES.md)

**Avoids:**
- Pitfall #7 (memory exhaustion) — file-by-file processing, not load-entire-EPUB
- Pitfall #8 (UTF-8 validation) — validate/clean UTF-8 before tokenizer
- Pitfall #9 (whitespace normalization) — normalize before tokenization
- Pitfall #15 (repeated tokenizer loading) — load once, reuse across EPUBs

**Stack:** tokenizers (with http feature), serde/serde_json

**Architecture:** Tokenization Engine (registry, counter, word_counter), Output Layer

### Phase 3: Performance and Polish
**Rationale:** Optimize after correctness is established. Parallel processing with rayon can significantly speed up batch operations, but only after synchronous processing works correctly. This phase also adds UX enhancements like progress bars and summary statistics.

**Delivers:** Production-ready CLI with parallel processing, rich progress feedback, and batch statistics

**Addresses:**
- Parallel processing with `--jobs` flag (FEATURES.md differentiator)
- Summary statistics (FEATURES.md differentiator)
- Enhanced progress reporting (ETA, throughput)

**Avoids:**
- Pitfall #14 (synchronous processing) — add parallelism after profiling
- Pitfall #16 (unnecessary EPUB recompilation) — use in-memory ZIP parsing
- Pitfall #12 (poor progress reporting) — professional progress bars

**Stack:** rayon, indicatif

**Architecture:** Enhanced progress reporting, parallel processing orchestration

### Phase 4: Advanced Features (Optional)
**Rationale:** Competitive differentiators that aren't table stakes. Cost estimation makes the tool actionable for financial planning. Per-chapter breakdown supports context window planning. These can be added post-MVP based on user feedback.

**Delivers:** Enhanced CLI with cost estimation, per-chapter analysis, and optional diff mode

**Addresses:**
- Cost estimation calculator (FEATURES.md differentiator)
- Per-chapter breakdown (FEATURES.md differentiator)
- Diff mode (FEATURES.md differentiator)

**Stack:** No new dependencies required

**Architecture:** Enhancements to Output Layer and Tokenization Engine

### Phase Ordering Rationale

This order follows the **dependency chain** identified in architecture research:
1. CLI foundation must exist before we can process anything
2. EPUB parsing and text extraction are prerequisites for tokenization
3. Tokenization is the core value proposition and must be implemented before output
4. Performance optimizations come after correctness is proven
5. Advanced features build on working tokenization and output

The ordering also **mitigates critical risks early**:
- Phase 1 addresses EPUB parsing pitfalls (malformed XHTML, spine mismatches) which affect all EPUB processing
- Phase 2 addresses memory exhaustion (Pitfall #7) and tokenizer issues (Pitfall #8, #9) which are foundational to accurate operation
- Phase 3 addresses performance only after we know the tool works correctly
- Phase 4 adds polish and competitive features based on proven foundation

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2 (Tokenization Engine):** Critical path—verify that Rust tokenizers crate with `http` feature can successfully load GPT-4/Claude tokenizers from Hub and tokenize sample text. Create spike test early in sprint planning.

- **Phase 2 (Memory Management):** Needs validation that file-by-file processing (natural chunks) is sufficient to avoid Pitfall #7 (150x memory expansion). May need to research Hugging Face Rust bindings for `refresh_every` parameter or alternative memory management strategies.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (CLI and EPUB Parsing):** Well-documented patterns—clap for CLI, epub crate for ZIP parsing. Rust CLI book provides comprehensive guidance.

- **Phase 3 (Performance):** Standard optimization approach—profile with realistic workload, add parallelism with rayon. No domain-specific challenges.

- **Phase 4 (Advanced Features):** Straightforward enhancements building on working tokenization. Cost estimation is simple math, per-chapter is structural enhancement to extraction.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core dependencies verified with official sources (docs.rs, GitHub repos). Rust ecosystem maturity is well-established. |
| Features | HIGH | Based on analysis of existing tools (epub-wordcount, epub-utils, tiktoken-cli) and official OpenAI/Claude documentation. Table stakes are clear. |
| Architecture | HIGH | Based on Rust CLI Book (official guide), Hugging Face tokenizers docs, and established pipeline patterns. Component responsibilities are well-defined. |
| Pitfalls | MEDIUM | EPUB parsing pitfalls verified with HIGH confidence sources (W3C EPUBCheck, MobileRead forums). Tokenization pitfalls verified with Hugging Face GitHub issues. Some gaps around Rust-specific memory management (Python docs reference `refresh_every` but Rust bindings may differ). |

**Overall confidence:** HIGH

### Gaps to Address

- **Rust tokenizers memory management:** Research indicates Python tokenizers have `refresh_every` parameter for memory stabilization, but it's unclear if Rust bindings expose this. **Handle during Phase 2 planning:** Test with large EPUBs, profile memory usage, verify if file-by-file processing is sufficient or if additional chunking is needed.

- **Real-world EPUB corpus for testing:** Need sources of problematic EPUBs for integration testing (spine mismatches, encoding issues, malformed XHTML). **Handle during Phase 1 execution:** Collect sample EPUBs from Project Gutenberg, Calibre conversions, and intentionally malformed test files.

- **UTF-8 cleaning strategies:** Research recommends validating/cleaning UTF-8 before tokenization (Pitfall #8) but doesn't specify best practices in Rust. **Handle during Phase 2 planning:** Research Rust UTF-8 handling crates (e.g., `encoding_rs`), implement validation with replacement character U+FFFD, log issues separately.

- **Tokenizer model name mappings:** Clear mappings needed between user-friendly names (e.g., "gpt4") and Hugging Face model IDs (e.g., "openai/gpt-4"). **Handle during Phase 2 planning:** Research official tokenizer identifiers, create mapping table, document in CLI help.

## Sources

### Primary (HIGH confidence)
- [epub crate docs.rs](https://docs.rs/crate/epub/latest) — EPUB parsing library verification
- [tokenizers crate docs.rs](https://docs.rs/crate/tokenizers/latest) — Hugging Face Rust tokenizers
- [clap crate docs.rs](https://docs.rs/crate/clap/latest) — CLI argument parsing
- [Rust CLI Book](https://rust-cli.github.io/book/) — Official Rust CLI guide
- [W3C EPUB 3.3 Specification](https://w3c.github.io/epub-specs/epub33/core/) — EPUB format standard
- [MobileRead Forums - EPUB spine id not matching error](https://www.mobileread.com/forums/showthread.php?t=211826) — Common EPUB validation errors
- [Hugging Face tokenizers GitHub Issues #994, #1539](https://github.com/huggingface/tokenizers/issues) — Memory exhaustion issues

### Secondary (MEDIUM confidence)
- [xavdid/epub-wordcount](https://github.com/xavdid/epub-wordcount) — EPUB processing tool reference
- [ernestofgonzalez/epub-utils](https://github.com/ernestofgonzalez/epub-utils) — EPUB metadata extraction reference
- [oelmekki/tiktoken-cli](https://github.com/oelmekki/tiktoken-cli) — Tokenization CLI reference
- [Evil Martians - CLI UX Best Practices](https://evilmartians.com/chronicles/cli-ux-best-practices-3-patterns-for-improving-progress-displays) — Progress display patterns
- [Accessible Publishing - Common EPUB Issues](https://www.accessiblepublishing.ca/common-epub-issues/) — EPUB parsing challenges
- [Rust Users Forum - Continue execution errors](https://users.rust-lang.org/t/continue-execution-even-if-the-result-is-err-and-return-an-error-later/17349) — Error handling patterns

### Tertiary (LOW confidence)
- [arXiv - Exploiting Vocabulary Frequency Imbalance (2025)](https://arxiv.org/pdf/2508.15390) — Token distribution issues (academic paper, less directly applicable)
- [Dev Genius - Mastering Rust Efficiency (2025)](https://blog.devgenius.io/mastering-rust-efficiency-best-practices-for-writing-performant-code-b9b17d5fbc) — General Rust performance (not domain-specific)
- [BitsGalore - Extracting text from EPUB files](https://bitsgalore.org/2023/03/09/extracting-text-from-epub-files) — Extraction challenges (Python-focused, less relevant to Rust)

---
*Research completed: 2026-01-21*
*Ready for roadmap: yes*
