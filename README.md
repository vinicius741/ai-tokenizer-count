# EPUB Tokenizer Counter

A command-line tool for counting words and estimating tokens in EPUB files using various LLM tokenizers.

## Features

- Word counting from EPUB files
- Token estimation for multiple LLM tokenizers:
  - **GPT-4** (cl100k_base)
  - **Claude** (@anthropic-ai/tokenizer)
  - **Hugging Face models** (custom model support)
- Batch processing with parallel execution
- Progress indicators during processing
- JSON and Markdown output formats
- Continue-on-error behavior (processes all valid EPUBs even if some fail)
- Recursive directory scanning
- Summary statistics across all processed files

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Usage

```bash
# Process default ./epubs/ folder
npm start

# Process single file
npm start path/to/book.epub

# Process directory (non-recursive)
npm start ./books/

# Process directory recursively
npm start -r ./books/

# Custom input/output paths
npm start -i ./books/ -o ./output/
```

### Tokenizer Selection

```bash
# Single tokenizer (default: gpt4)
epub-counter -t gpt4

# Multiple tokenizers
epub-counter -t gpt4,claude

# Custom Hugging Face model
epub-counter -t hf:bert-base-uncased

# Mix of all types
epub-counter -t gpt4,claude,hf:gpt2
```

### Parallel Processing

```bash
# Use default (CPU count - 1)
epub-counter

# Use specific job count
epub-counter -j 4

# Use all available CPU cores
epub-counter -j all
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input <path>` | Input folder or file path | `./epubs/` |
| `-o, --output <path>` | Output folder path | `./results/` |
| `-t, --tokenizers <list>` | Comma-separated tokenizers | `gpt4` |
| `-r, --recursive` | Scan subdirectories recursively | `false` |
| `-j, --jobs <count>` | Number of parallel jobs | `CPU count - 1` |
| `--max-mb <size>` | Maximum EPUB text size in MB | `500` |
| `-v, --verbose` | Enable verbose output | `false` |

## Output

The tool generates two output files in the results directory:

### JSON Output (`results.json`)

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

### Markdown Output (`results.md`)

A formatted table with word counts, token counts, and metadata for each processed EPUB.

## Error Handling

- **FATAL errors**: Processing stops immediately (e.g., invalid configuration)
- **ERROR/WARN errors**: Processing continues; failed files are logged to `errors.log` and console

## Development

```bash
# Build TypeScript
npm run build

# Run directly with TypeScript (for development)
npx tsx src/cli/index.ts [options]
```

## Requirements

- Node.js with ES2022 module support
- TypeScript 5.6+
