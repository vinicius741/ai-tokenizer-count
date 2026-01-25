# EPUB Tokenizer Counter

A dual-interface tool for counting words and estimating tokens in EPUB files using various LLM tokenizers. Use the CLI for batch processing or the web UI for interactive analysis with visualizations and token budget planning.

## Features

- **Word and Token Counting**: Extract text from EPUB files and count words/tokens using multiple tokenizers
- **Multiple Tokenizer Support**:
  - **GPT-4** (cl100k_base)
  - **Claude** (@anthropic-ai/tokenizer)
  - **Hugging Face models** (custom transformers.js models)
- **Dual Interface**:
  - **CLI**: Batch processing with parallel execution and JSON/Markdown output
  - **Web UI**: Interactive analysis with real-time progress, visualizations, and token budget calculator
- **Batch Processing**: Process multiple EPUBs in parallel with continue-on-error behavior
- **Data Visualizations** (Web UI): Bar charts, scatter plots, comparison heatmaps, sortable tables
- **Token Budget Calculator** (Web UI): Three optimization strategies with cost estimation for OpenAI, Anthropic, and Google
- **Session Persistence** (Web UI): Restore previous sessions with local storage
- **Export Options**: CSV/JSON export for tables and budget results

## Installation

```bash
npm install
npm run build
```

## Usage

### CLI Interface

#### Basic Usage

```bash
# Process default ./epubs/ folder
npm start --

# Process single file
npm start -- path/to/book.epub

# Process directory (non-recursive)
npm start -- ./books/

# Process directory recursively
npm start -- -r ./books/

# Custom input/output paths
npm start -- -i ./books/ -o ./output/
```

#### Tokenizer Selection

```bash
# Single tokenizer (default: gpt4)
npm start -- -t gpt4

# Multiple tokenizers
npm start -- -t gpt4,claude

# Custom Hugging Face model
npm start -- -t hf:bert-base-uncased

# Mix of all types
npm start -- -t gpt4,claude,hf:gpt2
```

#### Discovering Hugging Face Models

List popular Hugging Face models compatible with transformers.js:

```bash
# List all popular models
npm start -- list-models

# Search for specific models
npm start -- list-models --search bert
npm start -- list-models --search llama
```

**Popular Hugging Face Models:**

| Architecture | Model Name | Usage |
|--------------|------------|-------|
| BERT | `hf:bert-base-uncased` | English text |
| BERT | `hf:Xenova/bert-base-uncased` | BERT (faster ONNX) |
| GPT-2 | `hf:gpt2` | English generation |
| GPT-2 | `hf:Xenova/gpt2` | GPT-2 (faster ONNX) |
| Llama 2 | `hf:meta-llama/Llama-2-7b` | General purpose |
| Llama 3 | `hf:meta-llama/Meta-Llama-3-8B` | General purpose (newer) |
| Mistral | `hf:mistralai/Mistral-7B-v0.1` | Multilingual |
| Phi | `hf:microsoft/phi-3-mini-4k-instruct` | Efficient LLM |
| Qwen | `hf:Qwen/Qwen2-7B` | Multilingual |

Browse all models: https://huggingface.co/models?library=transformers.js

#### Parallel Processing

```bash
# Use default (CPU count - 1)
npm start --

# Use specific job count
npm start -- -j 4

# Use all available CPU cores
npm start -- -j all
```

#### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input <path>` | Input folder or file path | `./epubs/` |
| `-o, --output <path>` | Output folder path | `./results/` |
| `-t, --tokenizers <list>` | Comma-separated tokenizers | `gpt4` |
| `-r, --recursive` | Scan subdirectories recursively | `false` |
| `-j, --jobs <count>` | Number of parallel jobs | `CPU count - 1` |
| `--max-mb <size>` | Maximum EPUB text size in MB | `500` |
| `-v, --verbose` | Enable verbose output | `false` |

#### CLI Output

The tool generates two output files in the results directory:

**JSON Output (`results.json`)**

```json
{
  "schema_version": "1.0",
  "results": [
    {
      "file_path": "path/to/book.epub",
      "word_count": 50000,
      "token_counts": {
        "gpt4": 75000,
        "claude": 68000
      },
      "epub_metadata": {
        "title": "Book Title",
        "author": "Author Name",
        "language": "en"
      },
      "processed_at": "2026-01-21T00:00:00.000Z"
    }
  ]
}
```

**Markdown Output (`results.md`)**: A formatted table with word counts, token counts, and metadata for each processed EPUB.

### Web UI

#### Starting the Web UI

```bash
# Start both server and frontend (development)
npm run dev

# Or start individually
npm run dev:server  # Fastify backend on port 3001
npm run dev:web     # Vite dev server on port 5173
```

Access the web UI at: **http://localhost:5173**

#### Web UI Features

- **File Upload**: Drag-and-drop EPUB files or select from a local folder
- **Real-Time Progress**: SSE-based progress streaming during processing
- **Data Visualizations**:
  - Bar chart: Word/token counts per EPUB
  - Scatter plot: Word count vs. token count correlation
  - Results table: Sortable columns with all results
- **Multi-Tokenizer Comparison**:
  - Side-by-side bar chart
  - Heatmap visualization
- **Token Budget Calculator**:
  - Three optimization strategies (Greedy, Best Value, Balanced)
  - Cost estimation for OpenAI, Anthropic, and Google
  - Export results to CSV/JSON
- **Session Persistence**: Automatic save/restore with local storage

#### Error Handling

- **FATAL errors**: Processing stops immediately (e.g., invalid configuration)
- **ERROR/WARN errors**: Processing continues; failed files are logged to `errors.log` and console (CLI) or displayed in the UI (Web)

## Development

### Building All Packages

```bash
npm run build        # Build shared, web, server, and compile TypeScript
npm run build:shared # Build shared package only
npm run build:web    # Build web UI only
npm run build:server # Build server only
```

### Running Tests

```bash
# CLI tests
npx tsx src/cli/__tests__/list-models.test.ts
npx tsx src/tokenizers/__tests__/hf-models.test.ts

# Shared package tests (if available)
npm test --workspace=packages/shared
```

## Project Structure

```
epub-tokenizer-count/
├── packages/shared/    # Shared types and utilities
├── server/            # Fastify backend (SSE, job queue, API)
├── web/               # React + Vite frontend (shadcn/ui)
├── src/               # Legacy CLI code
└── dist/              # Compiled TypeScript output
```

## Tech Stack

- **CLI**: TypeScript, Commander.js, cli-progress
- **Backend**: Fastify, Server-Sent Events (SSE), in-memory job queue
- **Frontend**: React, Vite, shadcn/ui, TanStack Table, Recharts
- **Tokenizers**: js-tiktoken, @anthropic-ai/tokenizer, @huggingface/transformers
- **EPUB Parsing**: @gxl/epub-parser

## Requirements

- Node.js 18+ with ES2022 module support
- TypeScript 5.6+

## License

MIT
