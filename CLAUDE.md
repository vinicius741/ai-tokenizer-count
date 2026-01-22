# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EPUB Tokenizer Counter - A Node.js TypeScript CLI tool for counting words and estimating tokens in EPUB files using various LLM tokenizers (GPT-4, Claude, Hugging Face models).

## Build & Run Commands

```bash
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled CLI (node dist/cli/index.js)
```

Run directly with TypeScript (for development):
```bash
npx tsx src/cli/index.ts [options]
```

Run tests:
```bash
npx tsx src/cli/__tests__/list-models.test.ts
npx tsx src/tokenizers/__tests__/hf-models.test.ts
```

## CLI Usage

```bash
epub-counter                    # Process ./epubs/ (default)
epub-counter path/to/book.epub  # Process single file
epub-counter ./books/           # Process directory (flat)
epub-counter -r ./books/        # Process directory (recursive)
epub-counter -i ./books/ -o ./output/  # Custom paths
```

**Key Options:**
- `-t, --tokenizers <list>` - Comma-separated tokenizers (gpt4, claude, hf:bert-base-uncased)
- `-o, --output <path>` - Output folder (default: ./results/)
- `-j, --jobs <count>` - Parallel jobs (default: CPU count - 1, use "all" for max cores)
- `--max-mb <size>` - Max EPUB text size in MB (default: 500)
- `-v, --verbose` - Enable verbose output

**Hugging Face Model Discovery:**
```bash
epub-counter list-models                    # List all popular models
epub-counter list-models --search bert      # Search for specific models
```
Browse models: https://huggingface.co/models?library=transformers.js

## Architecture

**Pipeline Pattern** - Data flows through distinct stages: file discovery → EPUB parsing → text extraction → tokenization → output generation.

### Core Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| CLI Entry | `src/cli/index.ts` | Commander-based CLI, orchestrates pipeline |
| List Models | `src/cli/commands/list-models.ts` | Hugging Face model discovery command |
| File Discovery | `src/file-discovery/scanner.ts` | EPUB file discovery (recursive, hidden file filtering) |
| EPUB Parsing | `src/epub/parser.ts` | Wrapper around `@gxl/epub-parser` |
| Text Extraction | `src/epub/text.ts` | Uses `toMarkdown()` to avoid HTML contamination |
| Metadata | `src/epub/metadata.ts` | Extracts title, author, language from OPF files |
| Tokenizer Registry | `src/tokenizers/index.ts` | Factory for creating tokenizers by name |
| GPT-4 | `src/tokenizers/gpt.ts` | Uses `js-tiktoken` (synchronous) |
| Claude | `src/tokenizers/claude.ts` | Uses `@anthropic-ai/tokenizer` (synchronous) |
| Hugging Face | `src/tokenizers/huggingface.ts` | Uses `@huggingface/transformers` (async) |
| HF Models | `src/tokenizers/hf-models.ts` | Curated list of popular transformers.js models |
| Error Handler | `src/errors/handler.ts` | Central processing with continue-on-error |
| Parallel Processing | `src/parallel/processor.ts` | Concurrent processing via `p-limit` |
| Output | `src/output/` | JSON (schema v1.0), Markdown, Table, Summary statistics |

### Key Design Patterns

- **Error Isolation**: Single EPUB failures don't stop batch processing (ERROR/WARN levels continue, FATAL exits)
- **Lazy Initialization**: Tokenizers loaded on first use
- **Synchronous vs Async**: GPT-4 and Claude tokenizers are synchronous; Hugging Face is async
- **Parallel Processing**: CPU-aware job defaults (`CPU count - 1`), configurable via `--jobs`

### Output Format

JSON output includes `schema_version: "1.0"` field for compatibility tracking.

## Tokenizer Specification

- `gpt4` - GPT-4 (cl100k_base via js-tiktoken)
- `claude` - Claude (@anthropic-ai/tokenizer)
- `hf:<model>` - Hugging Face model (e.g., `hf:bert-base-uncased`)

## Planning Structure

The project uses GSD methodology with detailed phase documentation in `.planning/`:

- `.planning/PROJECT.md` - Project goals, requirements, constraints
- `.planning/research/` - ARCHITECTURE.md, STACK.md, FEATURES.md, PITFALLS.md
- `.planning/phases/` - Individual phase plans with context and research

## Important Constraints

- Tokenizers: Must use industry-standard libraries (js-tiktoken, @anthropic-ai/tokenizer, @huggingface/transformers)
- Error handling: Tool must not crash on single EPUB failure
- Output: One JSON + Markdown file per run (combined results)
- EPUB format: Must handle standard EPUB 2.0 and 3.0
- TypeScript: ES2022 target with NodeNext module resolution
