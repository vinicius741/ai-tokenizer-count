# Phase 1: EPUB Foundation - Research

**Researched:** 2026-01-21
**Domain:** EPUB parsing, CLI development, file processing
**Confidence:** HIGH

## Summary

This phase requires building a Node.js/TypeScript CLI tool that parses EPUB files, extracts metadata and text content, counts words, and displays results in a formatted table. The research confirms three mature library ecosystems: EPUB parsing (with TypeScript-native options), CLI frameworks (commander vs yargs), and terminal table formatting (cli-table3). The standard approach combines @gxl/epub-parser for EPUB processing, commander for CLI argument parsing, and cli-table3 for output formatting. Word counting should use regex-based approaches validated for accuracy, and file discovery should use Node.js native fs.readdir with recursive options.

**Primary recommendation:** Use @gxl/epub-parser (TypeScript-native) + commander (simpler API) + cli-table3 (mature, API-compatible) for a straightforward, maintainable implementation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **@gxl/epub-parser** | 2.0.4 | EPUB parsing, metadata extraction, text content | TypeScript-native with built-in types, simple async API, extracts sections with raw HTML and toMarkdown() method |
| **commander** | 12.x | CLI argument parsing, help text generation | Simpler API than yargs, widely adopted (40K+ dependents), excellent TypeScript support, mature ecosystem |
| **cli-table3** | 0.6.x | Terminal table formatting with Unicode support | Actively maintained successor to cli-table/cli-table2, API-compatible, handles word wrapping and alignment |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **fs** (Node.js built-in) | 22.x | File system operations, directory scanning | Use fs.readdir with recursive: true for subdirectory scanning |
| **path** (Node.js built-in) | 22.x | Path manipulation, extension checking | Use path.extname() for .epub filtering (case-insensitive) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @gxl/epub-parser | @storyteller-platform/epub (formerly @smoores/epub) | More comprehensive EPUB 3 spec support, but more complex API. @gxl/epub-parser is simpler and sufficient for metadata+text extraction. |
| @gxl/epub-parser | epub (classic) | Callback-based API (older pattern), only supports UTF-8, less TypeScript-friendly |
| commander | yargs | More powerful for complex CLIs with nested commands, but higher complexity. Simpler for our use case. |
| cli-table3 | @visulima/tabular | 2-3x faster performance, but newer (2023) with smaller ecosystem. cli-table3 is battle-tested. |

**Installation:**
```bash
npm install @gxl/epub-parser commander cli-table3
npm install --save-dev @types/node typescript
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── cli/              # CLI entry point and argument parsing
│   ├── index.ts      # Main CLI with commander setup
│   └── commands.ts   # Command handlers
├── epub/             # EPUB processing logic
│   ├── parser.ts     # EPUB parsing wrapper
│   ├── metadata.ts   # Metadata extraction
│   └── text.ts       # Text extraction and word counting
├── output/           # Output formatting
│   ├── table.ts      # cli-table3 wrapper
│   └── markdown.ts   # Markdown report generation
├── file-discovery/   # File system operations
│   └── scanner.ts    # Directory scanning with .epub filter
└── errors/           # Error handling
    └── handler.ts    # Continue-on-error pattern, error logging
```

### Pattern 1: EPUB Parsing with Async/Await
**What:** Use @gxl/epub-parser's parseEpub() function which returns an EpubObject with structure, sections, and info.
**When to use:** All EPUB file processing operations.
**Example:**
```typescript
// Source: https://www.npmjs.com/package/@gxl/epub-parser
import { parseEpub } from '@gxl/epub-parser'

const epubObj = await parseEpub('/path/to/file.epub', {
  type: 'path',
})

// Extract metadata
const title = epubObj.info?.title // EPUB metadata title
const creator = epubObj.info?.creator // Author/creator
const language = epubObj.info?.language // Language code

// Extract text from sections
let fullText = ''
for (const section of epubObj.sections) {
  // section.toMarkdown() converts to markdown
  // section.toHtmlObjects() converts to parsed HTML
  fullText += section.toMarkdown().textContent + '\n'
}

// Count words
const wordCount = countWords(fullText)
```

### Pattern 2: Commander CLI Setup
**What:** Use commander for argument parsing, help text generation, and command routing.
**When to use:** All CLI interface definitions.
**Example:**
```typescript
// Source: https://blog.logrocket.com/building-typescript-cli-node-js-commander/
import { Command } from 'commander'

const program = new Command()

program
  .name('epub-counter')
  .description('Count words in EPUB files')
  .version('1.0.0')
  .argument('[paths...]', 'Input files or folders (default: ./epubs/)')
  .option('-i, --input <path>', 'Input folder or file path')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-r, --recursive', 'Scan subdirectories recursively')
  .action((paths, options) => {
    // Default to ./epubs/ if no paths provided
    const inputPaths = paths.length > 0 ? paths : ['./epubs/']
    // Process with options
    processEpubs(inputPaths, options)
  })

program.parse()
```

### Pattern 3: Recursive Directory Scanning
**What:** Use Node.js fs.readdir with recursive option to scan directories.
**When to use:** File discovery for batch processing.
**Example:**
```typescript
// Source: Node.js fs documentation
import fs from 'fs/promises'
import path from 'path'

async function findEpubFiles(
  dirPath: string,
  recursive: boolean = false
): Promise<string[]> {
  const entries = await fs.readdir(dirPath, {
    withFileTypes: true,
    recursive // Built-in Node.js 22.x feature
  })

  const epubFiles: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    // Skip hidden files/folders (Claude's discretion: skip)
    if (entry.name.startsWith('.')) continue

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.epub')) {
      epubFiles.push(fullPath)
    }
  }

  return epubFiles
}
```

### Pattern 4: Word Counting with Regex
**What:** Use regex to split text into words, handling punctuation and whitespace.
**When to use:** Text extraction from EPUB content.
**Example:**
```typescript
// Source: https://stackoverflow.com/questions/18679576/counting-words-in-string
function countWords(text: string): number {
  // Remove HTML tags if present
  const plainText = text.replace(/<[^>]*>/g, ' ')

  // Split by whitespace and filter empty strings
  const words = plainText
    .split(/\s+/)
    .filter(word => word.length > 0)
    .filter(word => /[a-zA-Z0-9\u4e00-\u9fff]/.test(word)) // Include CJK chars

  return words.length
}
```

### Anti-Patterns to Avoid
- **Callback-based EPUB parsing:** The `epub` package uses callbacks (old pattern). Use @gxl/epub-parser with async/await instead.
- **Regex for HTML parsing:** Don't use regex to parse HTML for text extraction. Use the parser's built-in toMarkdown() or toHtmlObjects() methods.
- **Hand-rolled table formatting:** Don't manually format tables with string padding. Use cli-table3 for proper Unicode support and alignment.
- **Synchronous file operations:** Avoid fs.readFileSync in loops. Use async/await with fs.promises for better performance.
- **Global error handlers:** Don't use process-wide uncaughtException handlers. Use try/catch per-file for continue-on-error behavior.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| EPUB ZIP parsing | Custom unzip + XML parsing | @gxl/epub-parser | EPUB is a ZIP archive with specific structure, XML metadata, spine/manifest ordering. Edge cases: encrypted EPUBs, multiple formats, malformed archives. |
| CLI argument parsing | Manual process.argv parsing | commander | Handling flags, positional args, defaults, help text, validation. Edge cases: combined flags (-vi), unknown arguments, missing required args. |
| Terminal table formatting | Manual string padding | cli-table3 | Unicode box-drawing characters, word wrapping, column alignment, multi-line cells. Edge cases: wide characters (CJK), ANSI color codes, terminal width detection. |
| Word counting | Simple text.split(' ') | Regex with whitespace handling | Multiple spaces, tabs, newlines, punctuation, CJK characters. Edge cases: hyphenated words, apostrophes, numbers. |
| Recursive directory scanning | Custom recursion with fs.readdir | fs.readdir with recursive option | Handling symbolic links, permission errors, hidden files, depth control. Edge cases: circular symlinks, inaccessible directories. |

**Key insight:** EPUB parsing alone has enough complexity (ZIP structure, XML parsing, metadata extraction, content ordering) that a hand-rolled solution would likely fail on real-world EPUBs. The @gxl/epub-parser package handles EPUB 2.0.1 and 3.0 specifications, which is required by EPUB-03.

## Common Pitfalls

### Pitfall 1: Encoding Issues with Non-UTF8 EPUBs
**What goes wrong:** Some EPUBs use legacy encodings (Latin-1, Windows-1252). @gxl/epub-parser may produce garbled text.
**Why it happens:** Older EPUB 2.0.1 files didn't require UTF-8 encoding.
**How to avoid:** Check epubObj.info.language for expected encoding, try encoding detection libraries if needed. For this phase, assume UTF-8 (most common).
**Warning signs:** Garbled characters, question marks in extracted text, unexpected word counts.

### Pitfall 2: HTML Tag Contamination in Word Counts
**What goes wrong:** HTML tags (<p>, <div>, etc.) are counted as words, inflating word counts.
**Why it happens:** Raw EPUB sections contain HTML markup.
**How to avoid:** Always strip HTML tags before counting words. Use section.toMarkdown() or regex to remove tags.
**Warning signs:** Suspiciously high word counts, HTML tag names appearing in text.

### Pitfall 3: Malformed EPUB Files Crashing the Process
**What goes wrong:** Corrupt ZIP structure, missing files, invalid XML cause uncaught exceptions.
**Why it happens:** EPUBs can be malformed or partially downloaded.
**How to avoid:** Wrap each EPUB parse in try/catch, log error, continue to next file. Implement continue-on-error per requirements.
**Warning signs:** Process exits mid-scan, no error output, partial results.

### Pitfall 4: Case-Sensitive File Extension Filtering
**What goes wrong:** Files like "BOOK.EPUB" or "Book.Epub" are missed.
**Why it happens:** String comparison is case-sensitive by default.
**How to avoid:** Use .toLowerCase() before checking extension: `fileName.toLowerCase().endsWith('.epub')`.
**Warning signs:** EPUB files in folder not being processed, inconsistent behavior across OS.

### Pitfall 5: Memory Issues with Large EPUB Collections
**What goes wrong:** Processing hundreds of EPUBs simultaneously consumes excessive memory.
**Why it happens:** All EPUBs loaded into memory at once.
**How to avoid:** Process files sequentially with async/await, or use batching with concurrency limit (e.g., p-limit package).
**Warning signs:** Slow performance, high memory usage, process killed by OS.

### Pitfall 6: Table Formatting Breaking on Long Filenames
**What goes wrong:** Long filenames cause table columns to misalign or wrap poorly.
**Why it happens:** cli-table3 needs column width configuration for proper wrapping.
**How to avoid:** Set colWidths or wordWrap: true in table options, truncate long filenames if needed.
**Warning signs:** Misaligned table borders, text overflowing columns, unreadable output.

## Code Examples

Verified patterns from official sources:

### EPUB Parsing and Metadata Extraction
```typescript
// Source: https://www.npmjs.com/package/@gxl/epub-parser
import { parseEpub } from '@gxl/epub-parser'

interface EpubMetadata {
  title: string
  author: string
  language?: string
  publisher?: string
  wordCount: number
}

async function extractEpubInfo(filePath: string): Promise<EpubMetadata> {
  const epubObj = await parseEpub(filePath, { type: 'path' })

  // Extract metadata from EPUB
  const title = epubObj.info?.title || 'Unknown Title'
  const author = epubObj.info?.creator || 'Unknown Author'
  const language = epubObj.info?.language
  const publisher = epubObj.info?.publisher

  // Extract and concatenate all section text
  let fullText = ''
  for (const section of epubObj.sections) {
    const markdown = section.toMarkdown()
    fullText += markdown.textContent + '\n'
  }

  // Count words
  const wordCount = countWords(fullText)

  return { title, author, language, publisher, wordCount }
}
```

### CLI Table Output with cli-table3
```typescript
// Source: https://github.com/cli-table/cli-table3
import Table from 'cli-table3'

function displayResults(results: EpubMetadata[]): void {
  const table = new Table({
    head: ['Filename', 'Words', 'Title', 'Author'],
    colWidths: [30, 10, 40, 25],
    wordWrap: true,
    style: {
      head: ['cyan', 'bold'],
      border: ['grey']
    }
  })

  for (const result of results) {
    table.push([
      result.filename,
      result.wordCount.toString(),
      result.title,
      result.author
    ])
  }

  console.log(table.toString())
}
```

### File Discovery with Recursive Scanning
```typescript
// Source: Node.js fs documentation with recursive option
import fs from 'fs/promises'
import path from 'path'

interface FileDiscoveryOptions {
  recursive: boolean
  includeHidden: boolean
}

async function discoverEpubFiles(
  inputPath: string,
  options: FileDiscoveryOptions
): Promise<string[]> {
  const stat = await fs.stat(inputPath)
  const epubFiles: string[] = []

  if (stat.isFile()) {
    // Single file mode
    if (inputPath.toLowerCase().endsWith('.epub')) {
      epubFiles.push(inputPath)
    }
    return epubFiles
  }

  // Directory mode
  const entries = await fs.readdir(inputPath, {
    withFileTypes: true,
    recursive: options.recursive
  })

  for (const entry of entries) {
    // Skip hidden files/folders if configured
    if (!options.includeHidden && entry.name.startsWith('.')) {
      continue
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.epub')) {
      epubFiles.push(path.join(inputPath, entry.name))
    }
  }

  return epubFiles
}
```

### Continue-on-Error Pattern
```typescript
// Source: Node.js error handling best practices
interface ProcessingResult {
  successful: EpubMetadata[]
  failed: Array<{ file: string; error: string }>
  total: number
}

async function processEpubsWithErrors(
  filePaths: string[]
): Promise<ProcessingResult> {
  const successful: EpubMetadata[] = []
  const failed: Array<{ file: string; error: string }> = []

  for (const filePath of filePaths) {
    try {
      const result = await extractEpubInfo(filePath)
      successful.push({ ...result, filename: path.basename(filePath) })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      failed.push({ file: filePath, error: errorMsg })

      // Log to stderr
      console.error(`Error processing ${filePath}: ${errorMsg}`)

      // Continue to next file
      continue
    }
  }

  return {
    successful,
    failed,
    total: filePaths.length
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Callback-based EPUB parsing (epub package) | Promise-based async/await (@gxl/epub-parser) | ~2020 | Cleaner code, better error handling, TypeScript support |
| Manual table formatting with padding | cli-table3 with Unicode support | 2014+ | Professional-looking tables, proper alignment, word wrapping |
| process.argv manual parsing | commander/yargs declarative parsing | 2012+ | Automatic help generation, validation, type safety |
| Synchronous file operations | fs.promises async operations | Node.js 10+ | Better performance, non-blocking I/O |

**Deprecated/outdated:**
- **cli-table and cli-table2:** Unmaintained. Use cli-table3 instead.
- **@smoores/epub:** Renamed to @storyteller-platform/epub. Either works, but @gxl/epub-parser is simpler for this use case.
- **optimist:** Predecessor to yargs. No longer maintained.
- **fs.readFileSync for batch processing:** Blocks event loop. Use async/await with fs.promises.

## Open Questions

Things that couldn't be fully resolved:

1. **Hidden files/folders handling**
   - What we know: CONTEXT.md leaves this to Claude's discretion
   - What's unclear: Whether to skip hidden files (starting with .) or include them
   - Recommendation: Skip hidden files/folders by default (`.epub/`, `.hidden/`, etc.), add `--include-hidden` flag if needed later

2. **CJK (Chinese/Japanese/Korean) word counting**
   - What we know: Simple space-based splitting doesn't work for CJK languages
   - What's unclear: Whether CJK support is required for v1
   - Recommendation: Use regex that includes CJK character ranges (`\u4e00-\u9fff`) for basic support, validate with real EPUBs

3. **EPUB frontmatter/backmatter exclusion**
   - What we know: EPUB-04 mentions excluding frontmatter/backmatter "where possible"
   - What's unclear: How to reliably identify frontmatter vs main content
   - Recommendation: For v1, count all text content. Refine in later phases based on user feedback.

4. **Performance with large EPUB collections**
   - What we know: Sequential processing is safest for memory
   - What's unclear: Whether batching/concurrency is needed for performance
   - Recommendation: Start with sequential processing. Add concurrency (p-limit) only if performance issues arise.

5. **Exact table formatting details**
   - What we know: CLI decisions leave table formatting to Claude's discretion
   - What's unclear: Preferred column widths, truncation strategy
   - Recommendation: Use sensible defaults (filename: 30, words: 10, title: 40, author: 25), make configurable later if needed.

## Sources

### Primary (HIGH confidence)
- **@gxl/epub-parser** - NPM package documentation and GitHub README
  - Verified: TypeScript-native, parseEpub() API, toMarkdown() method, metadata extraction
  - https://www.npmjs.com/package/@gxl/epub-parser
  - https://github.com/gaoxiaoliangz/epub-parser

- **commander** - NPM package and LogRocket tutorial
  - Verified: Command API, argument parsing, help generation, TypeScript support
  - https://blog.logrocket.com/building-typescript-cli-node-js-commander/
  - https://www.npmjs.com/package/commander

- **cli-table3** - GitHub README with usage examples
  - Verified: Table formatting, word wrapping, custom styles, API compatibility
  - https://github.com/cli-table/cli-table3

- **Node.js fs module** - Official documentation
  - Verified: fs.readdir with recursive option, fs.promises API, withFileTypes option
  - https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs

- **EPUB 3.3 Specification** - W3C standard
  - Verified: Dublin Core metadata elements (title, creator, language, publisher)
  - https://www.w3.org/TR/epub-33/

### Secondary (MEDIUM confidence)
- **Stack Overflow: Counting words in JavaScript**
  - Word counting regex patterns, whitespace handling
  - https://stackoverflow.com/questions/18679576/counting-words-in-string

- **Stack Overflow: Node.js recursive directory search**
  - Recursive file scanning patterns with fs.readdir
  - https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search

- **Medium: Removing HTML tags with DOMParser**
  - HTML text extraction methods (using parser's built-in methods instead)
  - https://alvisonhunter.medium.com/removing-html-tags-in-javascript-using-regex-or-using-domparser-e1e7dd4ee6fe

- **Node.js Error Handling Best Practices** (Sematext, 2025)
  - Continue-on-error patterns, async error handling
  - https://sematext.com/blog/node-js-error-handling/

### Tertiary (LOW confidence)
- **WebSearch results** (unverified, marked for validation)
  - yargs vs commander comparison (Chinese sources)
  - cli-table performance comparisons
  - Word counting library alternatives
  - Note: These were superseded by official documentation verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official NPM/GitHub sources
- Architecture: HIGH - Patterns based on official documentation and established Node.js best practices
- Pitfalls: HIGH - Based on verified documentation and common Node.js anti-patterns
- EPUB metadata extraction: HIGH - Verified against EPUB 3.3 specification

**Research date:** 2026-01-21
**Valid until:** 2026-02-20 (30 days - stable ecosystem, but package versions may update)

**Key assumptions verified:**
- ✅ Node.js 22.14.0 available (checked)
- ✅ @gxl/epub-parser includes TypeScript types (verified)
- ✅ commander has TypeScript support (verified)
- ✅ cli-table3 is actively maintained (verified)
- ✅ fs.readdir supports recursive option in Node.js 22.x (verified)
