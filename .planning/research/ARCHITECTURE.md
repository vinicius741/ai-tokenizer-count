# Architecture Patterns

**Domain:** EPUB Tokenizer CLI Tool
**Researched:** 2026-01-21

## Component Overview

An EPUB tokenizer CLI tool follows a **pipeline architecture pattern** where data flows through distinct stages: input discovery → EPUB parsing → text extraction → tokenization → output generation. Each component is responsible for a single concern and communicates through well-defined interfaces.

The architecture is designed around:
- **Sequential processing**: Each EPUB flows independently through the pipeline
- **Error isolation**: Failures in one component don't crash the entire system
- **Parallel processing**: Multiple EPUBs can be processed concurrently (future enhancement)
- **Testability**: Each component can be unit tested in isolation

## Component Breakdown

### CLI Layer
**Entry point** — Handles user interaction and configuration

- **Argument Parser** — Parses CLI arguments using `clap` to extract:
  - Input/output directory paths
  - Tokenizer selections (presets + custom)
  - Verbosity levels
  - Concurrency settings

- **Configuration Builder** — Validates and combines arguments into a `Config` struct:
  - Resolves relative paths to absolute paths
  - Validates directory existence and writability
  - Normalizes tokenizer specifications

- **Progress Reporter** — Provides user feedback during processing:
  - Shows current file being processed
  - Displays completion percentage
  - Reports errors without stopping execution

**Communicates with:** Orchestration Layer

### EPUB Processing Layer
**Core domain logic** — Handles EPUB file operations

- **EPUB Discoverer** — Scans input directory for EPUB files:
  - Filters by `.epub` extension
  - Supports recursive directory scanning
  - Handles file system errors gracefully

- **EPUB Parser** — Extracts content from EPUB structure:
  - Uses `lib-epub` or `epub` crate for ZIP extraction
  - Parses `container.xml` to locate `content.opf`
  - Reads manifest to identify content files
  - Handles both EPUB 2.0 and 3.0 formats

- **Text Extractor** — Pulls readable text from EPUB content:
  - Extracts text from XHTML/HTML chapters
  - Strips HTML tags and formatting
  - Preserves text order and structure
  - Handles encoding issues (UTF-8, etc.)

- **Metadata Extractor** — Pulls EPUB metadata for output:
  - Title, author, language
  - Publication date, publisher
  - ISBN, identifiers

**Communicates with:** Tokenization Engine, Error Handler

### Tokenization Engine
**Value-generating component** — Converts text to tokens

- **Tokenizer Registry** — Manages available tokenizers:
  - Built-in presets (GPT-4 cl100k_base, Claude)
  - Custom Hugging Face tokenizer specifications
  - Lazy loading of tokenizer models
  - Caching of loaded tokenizers

- **Text Processor** — Prepares text for tokenization:
  - Normalizes whitespace
  - Handles special characters
  - Splits long texts into chunks if needed
  - Preserves original text for reporting

- **Token Counter** — Performs actual tokenization:
  - Uses `tokenizers` crate (Hugging Face Rust implementation)
  - Supports multiple tokenizer types (BPE, WordPiece, etc.)
  - Returns token counts per tokenizer
  - Provides tokenization metadata

- **Word Counter** — Counts words independently:
  - Uses Unicode-aware word boundary detection
  - Handles multiple languages
  - Provides consistent word counting

**Communicates with:** Output Layer, Error Handler

### Output Layer
**Result persistence** — Writes and formats results

- **JSON Serializer** — Converts results to JSON:
  - Structures output with rich metadata
  - Ensures valid JSON syntax
  - Handles special characters and encoding

- **File Writer** — Writes output files:
  - Creates output directory if missing
  - Writes one JSON per EPUB
  - Uses atomic file writes (write to temp, then rename)
  - Handles file system errors

- **Result Aggregator** — (Optional) Creates summary statistics:
  - Total words/tokens across all EPUBs
  - Per-tokenizer summaries
  - Processing statistics (success rate, errors)

**Communicates with:** Filesystem, Error Handler

### Error Handling
**Cross-cutting concern** — Manages errors across all components

- **Error Classifier** — Categorizes errors by severity:
  - **Fatal**: Configuration errors, missing directories
  - **Recoverable**: Single EPUB parse failures, permission errors
  - **Warning**: Missing metadata, encoding issues

- **Error Logger** — Records errors for debugging:
  - Writes to `errors.log` with timestamps
  - Includes stack traces for debugging
  - Correlates errors with specific EPUB files

- **User Error Reporter** — Displays errors to user:
  - Shows recoverable errors without stopping
  - Provides actionable error messages
  - Uses color coding for severity (red = fatal, yellow = warning)

**Communicates with:** All components

## Data Flow

```
┌─────────────┐
│  CLI Args   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Configuration      │
│  Builder            │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐     ┌──────────────────┐
│  EPUB Discoverer    │────▶│ Progress Tracker │
└──────┬──────────────┘     └──────────────────┘
       │
       ▼
┌─────────────────────┐
│  For each EPUB:     │
│                     │
│  ┌───────────────┐  │
│  │ EPUB Parser   │  │
│  └───────┬───────┘  │
│          │          │
│          ▼          │
│  ┌───────────────┐  │
│  │Text Extractor │  │
│  └───────┬───────┘  │
│          │          │
│          ▼          │
│  ┌───────────────┐  │     ┌──────────────────┐
│  │Metadata       │  │────▶│ Error Handler    │
│  │Extractor      │  │     └──────────────────┘
│  └───────┬───────┘
│          │
│          ▼
│  ┌───────────────┐
│  │Tokenization   │
│  │Engine         │
│  └───────┬───────┘
│          │
│          ▼
│  ┌───────────────┐
│  │Output Layer   │
│  └───────────────┘
└─────────────────────┘
```

## Build Order

### 1. CLI Layer & Configuration (Foundation)
**Why first:** Establishes the program structure and configuration model.

**Components to build:**
- Basic `main.rs` with `clap` argument parsing
- `Config` struct with validation
- Basic error types

**Dependencies:** None

**Deliverable:** CLI that can parse arguments and validate configuration.

---

### 2. EPUB Discovery & Metadata Extraction (Validation)
**Why second:** Validates we can find and read EPUB files before complex processing.

**Components to build:**
- EPUB discoverer (file system scanning)
- Basic EPUB parser (ZIP extraction)
- Metadata extractor

**Dependencies:** CLI Layer

**Deliverable:** CLI that can list EPUBs and print their metadata.

---

### 3. Text Extraction (Core Functionality)
**Why third:** This is the core value — extracting text from EPUBs.

**Components to build:**
- Text extractor (HTML → plain text)
- Word counter

**Dependencies:** EPUB Parser

**Deliverable:** CLI that can extract and display text from EPUBs with word counts.

---

### 4. Tokenization Engine (Primary Feature)
**Why fourth:** The main differentiator — token counting using Hugging Face tokenizers.

**Components to build:**
- Tokenizer registry (presets + custom)
- Token counter using `tokenizers` crate
- Integration with Hugging Face models

**Dependencies:** Text Extraction (needs text to tokenize)

**Deliverable:** CLI that can tokenize EPUB text with multiple tokenizers.

---

### 5. Output Layer (Result Persistence)
**Why fifth:** Once we have results, we need to save them.

**Components to build:**
- JSON serializer
- File writer
- Result aggregator

**Dependencies:** Tokenization Engine (needs token counts to output)

**Deliverable:** CLI that writes JSON files with results.

---

### 6. Error Handling & Progress Reporting (Polish)
**Why last:** Cross-cutting concerns that improve UX.

**Components to build:**
- Error classifier and logger
- Progress reporter
- User error reporter

**Dependencies:** All components (wraps everything)

**Deliverable:** Production-ready CLI with robust error handling.

---

### Optional Enhancements (Post-MVP)
- Parallel processing of multiple EPUBs
- Summary statistics aggregation
- Incremental processing (skip already processed)
- Progress bar with ETA

## Error Handling Strategy

### Error Flow Architecture

```
┌─────────────────┐
│  Any Component  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Error Classifier   │
│  - Categorizes      │
│  - Adds context     │
└────────┬────────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────────┐  ┌──────────────┐
│ Error Logger    │  │ User Reporter│
│ (errors.log)    │  │ (terminal)   │
└─────────────────┘  └──────────────┘
         │
         ▼
┌─────────────────────┐
│  Decision:          │
│  - Fatal? → Exit    │
│  - Recoverable?     │
│    → Log & Continue │
└─────────────────────┘
```

### Error Categories

| Category | Action | Example |
|----------|--------|---------|
| **Fatal** | Stop processing immediately | Invalid config, missing directories |
| **Recoverable** | Log error, skip current EPUB, continue | Corrupted EPUB, parse errors |
| **Warning** | Log warning, continue processing | Missing metadata, encoding issues |

### Error Handling Principles

1. **Never crash on single EPUB failure**
   - Use `Result` types throughout
   - Wrap individual EPUB processing in `catch_unwind` if needed
   - Log error and continue to next file

2. **Provide actionable error messages**
   - "Failed to parse EPUB: file is corrupted"
   - "Tokenizer 'gpt-4' not found, using 'cl100k_base' instead"
   - Include file path in error context

3. **Log everything, show what matters**
   - All errors go to `errors.log` with full context
   - User sees only summary: "Processed 10/12 EPUBs, 2 errors"

4. **Atomic operations**
   - Write output to temp file, then rename
   - Prevents partial/corrupted output files
   - Failed EPUBs don't create output files

## Module Structure (Suggested)

```
src/
├── main.rs                 # Entry point, CLI setup
├── cli/
│   ├── mod.rs
│   ├── args.rs             # Clap argument definitions
│   └── config.rs           # Config struct and validation
├── epub/
│   ├── mod.rs
│   ├── discoverer.rs       # EPUB file discovery
│   ├── parser.rs           # EPUB parsing (ZIP, OPF)
│   ├── extractor.rs        # Text extraction from HTML
│   └── metadata.rs         # Metadata extraction
├── tokenization/
│   ├── mod.rs
│   ├── registry.rs         # Tokenizer registry and loading
│   ├── counter.rs          # Token counting logic
│   └── word_counter.rs     # Word counting logic
├── output/
│   ├── mod.rs
│   ├── serializer.rs       # JSON serialization
│   ├── writer.rs           # File writing
│   └── models.rs           # Output data structures
├── error/
│   ├── mod.rs
│   ├── types.rs            # Error type definitions
│   ├── classifier.rs       # Error categorization
│   └── logger.rs           # Error logging
├── progress/
│   ├── mod.rs
│   └── reporter.rs         # Progress reporting
└── lib.rs                  # Library exports (for testing)
```

## Architecture Patterns to Follow

### 1. Library-Binary Pattern
**What:** Separate library crate (`lib.rs`) from binary (`main.rs`)

**Why:**
- Enables unit testing of business logic without CLI
- Allows reuse as a library in other projects
- Clear separation of concerns

**Example:**
```rust
// lib.rs
pub fn process_epub(config: &Config, epub_path: &Path) -> Result<Output> {
    // Core logic
}

// main.rs
use epub_tokenizer::{process_epub, Config};

fn main() {
    let config = Config::from_args();
    // CLI handling
}
```

### 2. Builder Pattern for Configuration
**What:** Use builder pattern to construct complex configuration

**Why:**
- Fluent API for configuration
- Validation at build time
- Clear construction order

**Example:**
```rust
let config = Config::builder()
    .input_dir("./epubs")
    .output_dir("./results")
    .add_tokenizer("gpt-4")
    .add_tokenizer("claude")
    .build()
    .expect("Invalid configuration");
```

### 3. Pipeline Pattern for Processing
**What:** Chain processing stages together

**Why:**
- Clear data flow
- Easy to add/remove stages
- Testable in isolation

**Example:**
```rust
let result = epub_path
    |> parse_epub
    |> extract_text
    |> extract_metadata
    |> tokenize(&tokenizers)
    |> count_words
    |> serialize_output;
```

### 4. Trait Objects for Tokenizers
**What:** Use trait objects for multiple tokenizer types

**Why:**
- Runtime tokenizer selection
- Easy to add new tokenizers
- Consistent interface

**Example:**
```rust
trait Tokenizer {
    fn tokenize(&self, text: &str) -> Vec<Token>;
    fn count(&self, text: &str) -> usize;
}

struct TokenizerRegistry {
    tokenizers: HashMap<String, Box<dyn Tokenizer>>,
}
```

## Architecture Anti-Patterns to Avoid

### 1. Monolithic main.rs
**What:** Putting all logic in `main.rs`

**Why bad:**
- Impossible to test
- Hard to maintain
- Can't reuse as library

**Instead:** Use library-binary pattern, separate concerns into modules

### 2. Tight Coupling to CLI
**What:** Business logic depends on CLI structures

**Why bad:**
- Can't use as library
- Hard to test
- CLI changes ripple through code

**Instead:** Keep CLI layer thin, business logic in library

### 3. Global Mutable State
**What:** Using `static mut` or lazy_static for shared state

**Why bad:**
- Thread safety issues
- Hard to test
- Implicit dependencies

**Instead:** Pass context explicitly through function arguments

### 4. Error Swallowing
**What:** Using `.unwrap()` or ignoring errors

**Why bad:**
- Crashes in production
- No error context
- Hard to debug

**Instead:** Use `Result` types, proper error propagation

### 5. Synchronous File I/O in Hot Path
**What:** Reading/writing files synchronously during processing

**Why bad:**
- Blocks processing
- Poor performance
- Bad user experience

**Instead:** Use async I/O with `tokio` if processing many files, or batch operations

## Scalability Considerations

| Concern | At 10 EPUBs | At 1,000 EPUBs | At 100,000 EPUBs |
|---------|-------------|----------------|------------------|
| **Processing** | Sequential is fine | Sequential works but slow | Need parallel processing |
| **Memory** | Load full EPUB to memory | Load EPUB one at a time | Stream EPUB content |
| **Tokenizer Loading** | Load each time | Cache tokenizers | Share tokenizers across threads |
| **Output** | Write directly to disk | Batch writes | Use async file I/O |
| **Progress** | Print to console | Progress bar | Progress bar + ETA |

### Scalability Recommendations

**For MVP (1,000 EPUBs):**
- Sequential processing
- Tokenizer caching
- Progress indicator
- Continue-on-error behavior

**For Scale (100,000+ EPUBs):**
- Parallel processing with `rayon`
- Async file I/O with `tokio`
- Streaming text extraction
- Distributed processing (sharding)

## Sources

### EPUB Processing
- [EPUB Files Deconstructed](https://www.spencerjensen.dev/2024/12/epub-files-deconstructed.html) - HIGH confidence (official EPUB structure)
- [mathieu-keller/epub-parser (GitHub)](https://github.com/mathieu-keller/epub-parser) - MEDIUM confidence (implementation reference)
- [lib-epub crate](https://crates.io/crates/lib-epub/0.0.6) - HIGH confidence (current Rust crate)

### Rust CLI Architecture
- [Command Line Applications in Rust Book](https://rust-cli.github.io/book/) - HIGH confidence (official guide)
- [Rust CLI Recommendations (GitHub)](https://github.com/sunshowers-code/rust-cli-recommendations) - HIGH confidence (community best practices)
- [Effective Error Handling in Rust CLI Apps](https://technorely.com/insights/effective-error-handling-in-rust-cli-apps-best-practices-examples-and-advanced-techniques) - MEDIUM confidence (best practices)

### Tokenization
- [Hugging Face Tokenizers Crate](https://crates.io/crates/tokenizers) - HIGH confidence (official crate)
- [The tokenization pipeline](https://huggingface.co/docs/tokenizers/pipeline) - HIGH confidence (official documentation)
- [Hugging Face Tokenizers GitHub](https://github.com/huggingface/tokenizers) - HIGH confidence (official repository)

### File Processing Pipelines
- [A basic Rust streaming ETL pipeline](https://www.peculiar-coding-endeavours.com/2025/rust-etl-pipeline/) - MEDIUM confidence (pattern reference)
- [adaptive-pipeline crate](https://crates.io/crates/adaptive-pipeline) - LOW confidence (reference only)

### Confidence Notes
- EPUB structure and parsing: HIGH confidence based on official documentation
- Rust CLI patterns: HIGH confidence based on official Rust CLI book
- Tokenization pipeline: HIGH confidence based on Hugging Face docs
- Specific crate recommendations: MEDIUM confidence (based on 2026 research but always verify current versions)
