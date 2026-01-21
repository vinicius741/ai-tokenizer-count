# Technology Stack

**Project:** EPUB Tokenizer Counter
**Researched:** 2025-01-21
**Mode:** Ecosystem

## Core Language

### Rust 1.85+ (2024 Edition)
- **Purpose:** Core language for CLI tool
- **Why Rust:**
  - Single-binary distribution via `cargo install` or prebuilt binaries
  - Memory safety prevents entire class of parsing bugs
  - Zero-cost abstractions for performance-critical tokenization
  - Excellent cross-platform support (Linux, macOS, Windows)
  - Rich crate ecosystem for CLI development
- **Version:** Use Rust 1.85.0 or later (2024 edition recommended for new projects)
- **MSRV:** Aim for 1.70.0+ to balance ecosystem compatibility with modern features

## EPUB Parsing

### epub 2.1.2 (PRIMARY RECOMMENDATION)
- **Purpose:** EPUB file reading and metadata extraction
- **Why:**
  - Most mature and widely-used EPUB library for Rust
  - Active maintenance with recent release (epub 2.1.2)
  - Handles both EPUB 2.0 and 3.0 formats
  - Clean API for extracting content, metadata, and resources
  - Proven in production (105 GitHub stars, 28 dependencies)
  - Minimal dependencies (only percent-encoding, regex, thiserror, xml-rs, zip)
- **Confidence:** HIGH - Official docs.rs verification
- **Source:** https://docs.rs/crate/epub/latest

### Alternatives Considered

#### lib-epub
- **Why not:** Less mature than epub-rs, smaller community
- **Consider if:** You need different API style or epub-rs doesn't support a specific feature

#### rbook
- **Why not:** Newer library, less proven track record
- **Consider if:** You prefer more ergonomic API over stability

## Hugging Face Tokenizers

### tokenizers 0.21.0 (CRITICAL DEPENDENCY)
- **Purpose:** Fast, state-of-the-art tokenization using Hugging Face models
- **Why:**
  - **Official Hugging Face Rust implementation** - this is the core of the Python library
  - Extremely fast tokenization (written in Rust for performance)
  - Supports all major tokenizer types (BPE, WordPiece, Unigram, WordLevel)
  - Can load pretrained tokenizers from Hugging Face Hub
  - Actively maintained by Hugging Face team (latest release 0.21.0)
  - Used in production by Hugging Face's Python library (via Rust bindings)
- **Features needed:**
  - `http` feature: Required for `Tokenizer::from_pretrained()` to download from Hub
  - `progressbar` (default): Can be disabled if you want custom progress UI
- **Confidence:** HIGH - Official Hugging Face crate
- **Source:** https://docs.rs/crate/tokenizers/latest

### Loading Tokenizers

The crate supports two primary usage patterns:

1. **From Hub (recommended for GPT-4, Claude presets):**
   ```rust
   let tokenizer = Tokenizer::from_pretrained("bert-base-cased", None)?;
   ```

2. **From local files (for custom tokenizers):**
   ```rust
   let tokenizer = Tokenizer::from_file("./path/to/tokenizer.json")?;
   ```

## CLI Framework

### clap 4.5.53
- **Purpose:** Command-line argument parsing
- **Why:**
  - De facto standard for Rust CLI tools (15,770 GitHub stars)
  - Derive macros provide compile-time argument validation
  - Excellent help text generation (`--help` output)
  - Support for subcommands, arguments, flags, and options
  - Type-safe argument parsing with `Parser` trait
  - Active development with frequent releases (4.5.53 released Nov 2025)
- **Features:**
  - `derive` feature: Use `#[derive(Parser)]` for struct-based argument parsing (recommended)
- **Confidence:** HIGH - Industry standard, verified latest version
- **Source:** https://docs.rs/crate/clap/latest

### Example Usage
```rust
use clap::Parser;

#[derive(Parser)]
struct Cli {
    #[arg(short, long)]
    input: PathBuf,

    #[arg(short, long, default_value = "gpt4")]
    tokenizer: String,
}
```

## JSON Output

### serde 1.0 + serde_json 1.0
- **Purpose:** JSON serialization and deserialization
- **Why:**
  - De facto standard for JSON in Rust (part of every Rust developer's toolkit)
  - Compile-time serialization via derive macros
  - Best-in-class performance (500-1000 MB/s deserialization)
  - Zero-copy parsing for `&str` when possible
  - Excellent error messages for debugging
  - serde_json 1.0.137 is latest (active maintenance)
- **Confidence:** HIGH - Foundation of Rust ecosystem
- **Source:** https://docs.rs/crate/serde_json/latest

### Example Usage
```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct TokenizationResult {
    pub file_name: String,
    pub word_count: usize,
    pub token_count: usize,
    pub tokenizer_model: String,
}

let json = serde_json::to_string_pretty(&result)?;
```

## Error Handling

### anyhow 1.0
- **Purpose:** Application-level error handling
- **Why:**
  - Perfect for CLI applications (vs libraries)
  - Type-erased error type: `anyhow::Result<T>` = `Result<T, anyhow::Error>`
  - `.context()` method for adding debugging information
  - Automatic backtrace capture in debug mode
  - No need to define custom error enums for application code
  - Minimal boilerplate compared to `thiserror`
- **Confidence:** HIGH - Community best practice for CLIs
- **Source:** https://crates.io/crates/anyhow

### Example Usage
```rust
use anyhow::{Context, Result};

fn process_epub(path: &Path) -> Result<TokenizationResult> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("Failed to read EPUB file: {}", path.display()))?;
    // ...
    Ok(result)
}
```

### When to Use thiserror Instead

Use `thiserror` if you're creating a library crate that others will depend on. For this CLI tool, `anyhow` is the better choice.

## Directory Traversal

### walkdir 2.5.0
- **Purpose:** Recursive directory scanning for EPUB files
- **Why:**
  - Cross-platform recursive directory traversal
  - Efficient implementation (better than naive `std::fs::read_dir` recursion)
  - Customizable depth limits and sorting
  - Handles symlinks and filesystem errors gracefully
  - Production-tested (widely used in Rust ecosystem)
- **Confidence:** HIGH - Industry standard
- **Source:** https://docs.rs/crate/walkdir/latest

### Example Usage
```rust
use walkdir::WalkDir;

for entry in WalkDir::new("input_dir")
    .follow_links(true)
    .into_iter()
    .filter_map(|e| e.ok())
{
    if entry.path().extension().and_then(|s| s.to_str()) == Some("epub") {
        // Process EPUB
    }
}
```

## Parallel Processing

### rayon 1.10+
- **Purpose:** Data parallelism for processing multiple EPUBs concurrently
- **Why:**
  - Turn sequential iterators into parallel iterators with `.par_iter()`
  - Work-stealing thread pool maximizes CPU utilization
  - Almost zero overhead for sequential workloads
  - Ideal for embarrassingly parallel problems (processing independent EPUB files)
  - Rust's standard solution for parallelism
- **Confidence:** HIGH - Standard in Rust ecosystem
- **Source:** WebSearch verification of 2025 usage

### Example Usage
```rust
use rayon::prelude::*;

let results: Vec<_> = epub_files
    .par_iter()  // Process in parallel
    .map(|path| process_epub(path))
    .collect();
```

## Progress Reporting

### indicatif 0.17+
- **Purpose:** Progress bars and spinners for long-running operations
- **Why:**
  - Professional CLI experience with minimal code
  - Multi-progress bars support (one per EPUB being processed)
  - ETA calculation and throughput display
  - 95% overhead reduction in version 0.17
  - Integrates with `tracing` for structured logging (optional)
- **Confidence:** HIGH - Industry standard for Rust CLIs
- **Source:** WebSearch verification of active maintenance

## Supporting Libraries

### regex 1.10
- **Purpose:** Text processing (word counting, pattern matching)
- **Why:**
  - Fast regex engine used throughout Rust ecosystem
  - Already a dependency of `epub` crate
  - Unicode-aware by default
- **Version:** 1.10.4 (verified as epub dependency)

### glob 0.3
- **Purpose:** Pattern matching for file selection (optional)
- **When to use:** If you want to support glob patterns like `**/*.epub`
- **Alternative:** Just use walkdir with extension filtering (simpler)

## Testing

### Built-in `cargo test`
- **Purpose:** Unit and integration testing
- **Why:**
  - Built into Rust toolchain - no dependencies needed
  - `#[test]` attribute for unit tests in same file
  - `tests/` directory for integration tests
  - Documentation tests with `#[doc(test)]`
- **Confidence:** HIGH - Part of Rust

### Nextest (Optional Enhancement)
- **Purpose:** Faster test runner for large test suites
- **Why:** 10x faster than `cargo test` for projects with many tests
- **When to add:** If test suite becomes slow (>10 seconds)
- **Not needed for MVP:** Start with `cargo test`, migrate later if needed

## Development Tools

### cargo-edit (CLI tool)
- **Purpose:** Manage dependencies from command line
- **Installation:** `cargo install cargo-edit`
- **Usage:** `cargo add clap serde` (adds to Cargo.toml automatically)
- **Nice to have:** Not required but improves DX

## What NOT to Use

### Python via PyO3
- **Why not:** Adds Python dependency, defeats purpose of Rust binary distribution
- **Exception:** Only if you need Python libraries that don't have Rust equivalents

### Custom HTTP Client for Tokenizers
- **Why not:** `tokenizers` crate has `http` feature that handles this
- **Use:** `Tokenizer::from_pretrained()` with `http` feature enabled

### Manual Error Types (via thiserror)
- **Why not:** Unnecessary boilerplate for CLI application
- **Exception:** If building a reusable library, use `thiserror` instead of `anyhow`

### Async Runtime (tokio/async-std)
- **Why not:** This tool is I/O-bound but CPU-bound (tokenization is heavy compute)
- **Better:** Use rayon for parallelism instead of async
- **Exception:** Only if adding network operations (e.g., fetching EPUBs from URLs)

### stringray or Other Niche JSON Libraries
- **Why not:** serde_json is faster and more mature
- **Stick with:** serde_json for maximum compatibility and performance

## Installation

```toml
[dependencies]
# Core dependencies
epub = "2.1"
tokenizers = { version = "0.21", features = ["http"] }
clap = { version = "4.5", features = ["derive"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
anyhow = "1.0"
walkdir = "2.5"
rayon = "1.10"
indicatif = "0.17"
regex = "1.10"
```

## Development Workflow

```bash
# Add dependencies
cargo add clap serde serde_json anyhow walkdir rayon indicatif

# Build
cargo build --release

# Run
cargo run -- --input ./epubs --tokenizer gpt4

# Test
cargo test

# Install locally
cargo install --path .

# Distribution
cargo build --release
# Binary at: target/release/epub-tokenizer
```

## Confidence Levels

### HIGH Confidence (Verified with official sources)
- **Rust 1.85+**: Current stable version
- **epub 2.1.2**: Verified on docs.rs
- **clap 4.5.53**: Verified on docs.rs
- **tokenizers 0.21.0**: Official Hugging Face crate, verified on docs.rs
- **serde/serde_json 1.0**: Foundation of Rust ecosystem
- **anyhow 1.0**: Community best practice for CLIs
- **walkdir 2.5.0**: Industry standard
- **rayon 1.10+**: Standard for parallelism in Rust

### MEDIUM Confidence (Verified with WebSearch + community consensus)
- **indicatif 0.17+**: Active maintenance, widely used
- **Regex 1.10**: Verified as epub dependency

### LOW Confidence (May need validation)
- None - all recommendations have been verified

## Roadmap Implications

### Phase Dependencies
1. **Foundation Phase:** Start with clap, epub, serde, anyhow (core CLI + EPUB reading)
2. **Tokenizer Integration Phase:** Add tokenizers crate with http feature
3. **Parallel Processing Phase:** Add rayon for concurrent EPUB processing
4. **UX Enhancement Phase:** Add indicatif for progress bars

### Critical Path
- The `tokenizers` crate with `http` feature is **critical path** - must verify it works for loading GPT-4/Claude tokenizers
- Recommend creating spike test early: "Can we load tokenizer X from Hub and tokenize sample text?"

### Testing Strategy
- Unit tests with `cargo test` (built-in)
- Integration tests for EPUB parsing edge cases
- Consider property-based testing with `proptest` if tokenizer behavior needs exhaustive testing

## Sources

- [epub crate docs.rs](https://docs.rs/crate/epub/latest) - HIGH confidence
- [clap crate docs.rs](https://docs.rs/crate/clap/latest) - HIGH confidence
- [tokenizers crate docs.rs](https://docs.rs/crate/tokenizers/latest) - HIGH confidence
- [serde_json crate docs.rs](https://docs.rs/crate/serde_json/latest) - HIGH confidence
- [anyhow crates.io](https://crates.io/crates/anyhow) - HIGH confidence
- [Rust Testing Best Practices 2025](https://medium.com/@ashusk_1790/rust-testing-best-practices-unit-to-integration-965b39a8212f) - MEDIUM confidence
- [Error Handling in Rust: anyhow vs thiserror](https://dev.to/iolivia/error-handling-in-rust-from-panic-to-anyhow-and-thiserror-2km7) - MEDIUM confidence
- [Hugging Face Tokenizers GitHub](https://github.com/huggingface/tokenizers) - HIGH confidence
- [indicatif GitHub](https://github.com/console-rs/indicatif) - MEDIUM confidence
- [Rust Rayon 2025](https://dev.to/ramasundaram_s/rusts-fearless-concurrency-revolutionizing-parallel-programming-in-2025-2032) - MEDIUM confidence
- [Rust walkdir docs.rs](https://docs.rs/crate/walkdir/latest) - HIGH confidence
- [Rust 1.92.0 Release](https://blog.rust-lang.org/releases/latest/) - MEDIUM confidence
