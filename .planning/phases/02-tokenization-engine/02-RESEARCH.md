# Phase 2: Tokenization Engine - Research

**Researched:** 2026-01-21
**Domain:** Tokenization libraries and patterns for Node.js/TypeScript
**Confidence:** HIGH

## Summary

This research investigated the tokenization landscape for Node.js/TypeScript applications in 2026, focusing on libraries that support GPT-4, Claude, and Hugging Face tokenizers. The key finding is that **three mature libraries** form the standard stack for JavaScript tokenization:

1. **js-tiktoken** - The standard for OpenAI/GPT tokenization (pure JS port of OpenAI's tiktoken)
2. **@anthropic-ai/tokenizer** - Official Anthropic package for Claude tokenization (with limitations)
3. **@huggingface/transformers** - The official Hugging Face Transformers.js library for arbitrary tokenizer support

**Primary recommendation:** Use js-tiktoken for GPT-4, @anthropic-ai/tokenizer for Claude (with documented caveats), and @huggingface/transformers for Hugging Face models. For Claude 3+ tokenization, note that the official tokenizer is no longer accurate and consider using Anthropic's API `usage` field instead.

**Key insight:** The Claude tokenizer has a documented limitation - it's only accurate for older Claude models, not Claude 3+. This is a critical architectural constraint that affects the TOKEN-03 requirement implementation.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **js-tiktoken** | 1.0.20+ | OpenAI/GPT tokenization (cl100k_base, o200k_base) | Pure JS port of OpenAI's official tiktoken library; actively maintained (last update 3 months ago); 259 dependents on npm |
| **@anthropic-ai/tokenizer** | Latest | Claude tokenization | Official Anthropic package; simple countTokens API |
| **@huggingface/transformers** | v3.0.0+ | Arbitrary Hugging Face tokenizer support | Official Hugging Face library; supports 120+ model architectures; 1200+ pre-converted models |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **ai-tokenizer** | Latest | High-performance alternative (5-7x faster than tiktoken) | When performance is critical and 97%+ accuracy is acceptable |
| **gpt-tokenizer** | Latest | Alternative GPT tokenizer | When looking for on-par performance with ai-tokenizer |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| js-tiktoken | ai-tokenizer | Faster (5-7x) but slightly less accurate; 97%+ accuracy vs 100%; no WASM dependency |
| @anthropic-ai/tokenizer | ai-tokenizer with Claude preset | More accurate for Claude 3+ models but not official |
| @huggingface/transformers | @xenova/transformers | Older v2 package; use official @huggingface/transformers v3+ instead |

**Installation:**
```bash
npm install js-tiktoken @anthropic-ai/tokenizer @huggingface/transformers
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── tokenizers/
│   ├── index.ts              # Main tokenizer orchestration
│   ├── gpt-tokenizer.ts      # GPT-4 tokenizer using js-tiktoken
│   ├── claude-tokenizer.ts   # Claude tokenizer using @anthropic-ai/tokenizer
│   ├── hf-tokenizer.ts       # Hugging Face tokenizer using @huggingface/transformers
│   ├── types.ts              # Token count result interfaces
│   └── __tests__/            # Tokenizer tests
├── output/
│   └── json.ts               # Extended to include token_counts
└── cli/
    └── index.ts              # Extended CLI arguments
```

### Pattern 1: Tokenizer Interface Abstraction

**What:** Create a unified interface for all tokenizer types to enable consistent usage

**When to use:** When supporting multiple tokenizer types (GPT, Claude, Hugging Face)

**Example:**
```typescript
// Source: Research-derived pattern
export interface Tokenizer {
  name: string;
  countTokens(text: string): number;
}

export class GPTTokenizer implements Tokenizer {
  name = 'gpt4';

  constructor(private encoding = 'cl100k_base') {
    // Initialize js-tiktoken
  }

  countTokens(text: string): number {
    // Use js-tiktoken to count
    return tokens;
  }
}
```

### Pattern 2: Lazy Initialization of Tokenizers

**What:** Load tokenizer models on-demand to reduce memory footprint

**When to use:** When supporting many tokenizer options but user typically selects 1-2

**Example:**
```typescript
// Source: js-tiktoken lite pattern
import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";

// Lazy load only when needed
let tokenizer: Tiktoken | null = null;

function getTokenizer() {
  if (!tokenizer) {
    tokenizer = new Tiktoken(o200k_base);
  }
  return tokenizer;
}
```

### Pattern 3: Streaming Tokenization for Large EPUBs

**What:** Process EPUB text file-by-file to avoid loading entire EPUB into memory

**When to use:** For large EPUBs with multiple text files (chapters)

**Example:**
```typescript
// Source: Research-derived from memory-safe streaming patterns
async function tokenizeEpubStream(epubText: AsyncIterable<string>, tokenizer: Tokenizer) {
  let totalTokens = 0;

  for await (const chunk of epubText) {
    totalTokens += tokenizer.countTokens(chunk);
    // Allow garbage collection between chunks
  }

  return totalTokens;
}
```

### Anti-Patterns to Avoid

- **Loading all tokenizer models at startup:** Causes 85ms+ initialization delays and high memory usage (tiktoken WASM)
- **Tokenizing entire EPUB as single string:** Can cause OOM errors for large books
- **Using Claude tokenizer for Claude 3+:** Official tokenizer is documented as inaccurate for newer models
- **Synchronous tokenization in CLI:** Blocks event loop; use async/await for large texts

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| BPE tokenization | Custom byte-pair encoding implementation | js-tiktoken or ai-tokenizer | Edge cases with Unicode, special tokens, vocabulary management |
| GPT-4 tokenization | Manual cl100k_base implementation | js-tiktoken | Offsets, merge rules, special tokens are complex |
| Hugging Face tokenizer loading | Custom tokenizer.json parser | @huggingface/transformers | AutoTokenizer supports 120+ architectures with edge case handling |
| Claude tokenization | Custom Claude tokenizer | @anthropic-ai/tokenizer | Official implementation; though limited for Claude 3+ |
| Token counting for cost estimation | Character-based heuristics | js-tiktoken/ai-tokenizer | 1 token ≠ 1 character; accuracy matters for billing |

**Key insight:** Tokenization algorithms (BPE, WordPiece, Unigram) are deceptively complex. Building custom implementations leads to subtle bugs with special characters, Unicode normalization, and vocabulary edge cases. Use established libraries with test coverage.

## Common Pitfalls

### Pitfall 1: Claude 3+ Tokenizer Inaccuracy

**What goes wrong:** Using @anthropic-ai/tokenizer for Claude 3, Claude 3.5, Sonnet 4, etc. produces incorrect token counts

**Why it happens:** The official package documentation explicitly states: "As of the Claude 3 models, this algorithm is no longer accurate"

**How to avoid:**
1. Document this limitation prominently in code and CLI output
2. Add warning when Claude tokenizer is selected
3. Consider using Anthropic's API `usage` field for accurate counts if available
4. Alternative: Use ai-tokenizer with Claude models (98%+ accuracy per their benchmarks)

**Warning signs:** Token counts differ significantly from Claude API response usage field

### Pitfall 2: Memory Issues with Large EPUBs

**What goes wrong:** Processing entire EPUB content as single string causes Node.js OOM errors

**Why it happens:** Large books can be 1MB+ of text; tokenizers create intermediate arrays

**How to avoid:**
1. Process EPUB text file-by-file (chapters are separate files in EPUB structure)
2. Use streaming patterns for very large texts
3. Clear tokenizer caches between large files (tiktoken has cache clearing methods)
4. Add memory limits and chunking for texts > 500KB

**Warning signs:** Node.js heap out of memory errors; slow processing on large files

### Pitfall 3: Special Token Handling

**What goes wrong:** Not accounting for special tokens (EOS, BOS, padding) in count

**Why it happens:** Some tokenizers add special tokens automatically; others don't

**How to avoid:**
1. Test tokenization with known strings and verify counts match official implementations
2. Document whether special tokens are included in counts
3. Use `add_special_tokens: false` when comparing counts across models

**Warning signs:** Token counts are consistently higher than expected (e.g., always +2 tokens)

### Pitfall 4: Unicode and CJK Character Handling

**What goes wrong:** Incorrect tokenization of non-ASCII characters, CJK text

**Why it happens:** Different tokenizers handle Unicode normalization differently

**How to avoid:**
1. Test with non-ASCII text (emoji, accented characters, CJK)
2. Verify tokenizer behavior matches expected model behavior
3. Document Unicode normalization approach (NFC, NFD, etc.)

**Warning signs:** Single character becomes multiple tokens; mojibake in decoded output

### Pitfall 5: Initialization Performance

**What goes wrong:** CLI hangs on startup loading tokenizer models

**Why it happens:** Tiktoken WASM initialization takes 85ms+; loading multiple models compounds delay

**How to avoid:**
1. Use js-tiktoken/lite for faster initialization (14µs vs 85ms)
2. Lazy-load tokenizer models only when needed
3. Show progress indicator for slow-loading models
4. Cache initialized models in memory for repeated use

**Warning signs:** CLI feels sluggish on startup; high memory usage before processing

## Code Examples

Verified patterns from official sources:

### GPT-4 Tokenization with js-tiktoken

```typescript
// Source: https://www.npmjs.com/package/js-tiktoken
import { getEncoding, encodingForModel } from 'js-tiktoken';

// Option 1: Use specific encoding
const enc = getEncoding('cl100k_base');
const tokens = enc.encode('hello world');
console.log(tokens.length); // Token count

// Option 2: Use model to auto-select encoding
const enc = encodingForModel('gpt-4');
const tokens = enc.encode('hello world');
console.log(tokens.length);

// Free resources when done
enc.free();
```

### Claude Tokenization with Official Package

```typescript
// Source: https://github.com/anthropics/anthropic-tokenizer-typescript
import { countTokens } from '@anthropic-ai/tokenizer';

function countClaudeTokens(text: string): number {
  const tokens = countTokens(text);
  console.log(`'${text}' is ${tokens} tokens`);
  return tokens;
}

// WARNING: This is only accurate for older Claude models
// Claude 3+ requires API usage field for accurate counts
```

### Hugging Face Tokenizer Loading

```typescript
// Source: https://huggingface.co/docs/transformers.js/api/tokenizers
import { AutoTokenizer } from '@huggingface/transformers';

async function loadTokenizer(modelName: string) {
  const tokenizer = await AutoTokenizer.from_pretrained(modelName);

  // Tokenize text
  const { input_ids } = await tokenizer('Hello, world!');
  const tokenCount = input_ids.length;

  return tokenCount;
}

// Example usage:
// loadTokenizer('Xenova/bert-base-uncased')
// loadTokenizer('Xenova/gpt2')
// loadTokenizer('bert-base-uncased') // Local path or HF Hub model
```

### Extended JSON Output Structure

```typescript
// Extend existing EpubJsonResult interface
export interface EpubJsonResult {
  filename: string;
  file_path: string;
  title: string;
  author: string;
  word_count: number;
  language?: string;
  publisher?: string;
  // NEW: Token counts per tokenizer
  token_counts?: {
    [tokenizerName: string]: number;
    // Example:
    // "gpt4": 15234,
    // "claude": 18234,
    // "bert-base-uncased": 16892
  };
}
```

### CLI Argument Design

```typescript
// Source: Research-derived pattern for multiple tokenizer selection
program
  .option('-t, --tokenizers <list>', 'Comma-separated list of tokenizers (e.g., gpt4,claude,hf:bert-base-uncased)', 'gpt4')
  .action((options) => {
    const tokenizers = options.tokenizers.split(',').map(t => t.trim());

    // Preset tokenizers
    if (tokenizers.includes('gpt4')) {
      // Use GPT-4 tokenizer
    }

    if (tokenizers.includes('claude')) {
      // Use Claude tokenizer (with warning)
      console.warn('Warning: Claude tokenizer is inaccurate for Claude 3+ models');
    }

    // Hugging Face models (format: hf:model-name)
    const hfModels = tokenizers.filter(t => t.startsWith('hf:'));
    for (const model of hfModels) {
      const modelName = model.replace('hf:', '');
      // Load and use HF tokenizer
    }
  });
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tiktoken (WASM) | js-tiktoken (pure JS) | 2023-2024 | Faster initialization, no WASM dependency |
| @xenova/transformers | @huggingface/transformers | Oct 2024 (v3) | Official Hugging Face org, WebGPU support, 120+ architectures |
| Custom Claude implementations | @anthropic-ai/tokenizer | 2023 | Official package but limited for Claude 3+ |
| Single-threaded tokenization | Streaming/chunked approaches | 2025 | Better memory management for large files |

**Deprecated/outdated:**
- **@anthropic-ai/tokenizer for Claude 3+:** Officially documented as inaccurate; use API `usage` field instead
- **tiktoken with WASM:** Still works but js-tiktoken is faster for Node.js (no WASM overhead)
- **@xenova/transformers (v2):** Use @huggingface/transformers v3+ for new features

## Open Questions

### 1. Claude 3+ Tokenization Strategy

**What we know:**
- @anthropic-ai/tokenizer is officially documented as inaccurate for Claude 3+
- ai-tokenizer claims 98%+ accuracy for Claude models but is not official
- Anthropic API returns accurate `usage` field in responses

**What's unclear:**
- What is the acceptable accuracy threshold for TOKEN-03 requirement?
- Should we use ai-tokenizer despite it being unofficial?
- Should we skip local Claude 3+ tokenization entirely and document limitation?

**Recommendation:**
- Implement @anthropic-ai/tokenizer with prominent warning for Claude 3+
- Document that accurate counts require API usage field
- Consider ai-tokenizer as alternative if 98% accuracy is acceptable
- Make this a user decision with CLI flag `--allow-inaccurate-claude`

### 2. Memory Limits for Large EPUBs

**What we know:**
- Large books can be 1MB+ of text
- js-tiktoken processes ~500KB in ~20ms (based on benchmarks)
- EPUBs are structured as multiple files (chapters)

**What's unclear:**
- What is the maximum EPUB size this tool should support?
- Should there be a memory limit threshold (e.g., reject EPUBs > 10MB)?
- What's the acceptable performance for large books?

**Recommendation:**
- Implement file-by-file processing (by chapter) for all EPUBs
- Add progress reporting for large EPUBs
- Set reasonable memory limit (e.g., 50MB heap)
- Document performance expectations

### 3. Hugging Face Model Caching

**What we know:**
- @huggingface/transformers downloads models from Hugging Face Hub
- Models can be large (100MB+ for some tokenizers)
- Downloads only happen once per model

**What's unclear:**
- Where should models be cached? (node_modules, user home, configurable)
- How to handle network failures during model download?
- Should we support offline mode (pre-download models)?

**Recommendation:**
- Use default @huggingface/transformers caching (node_modules/.cache)
- Add progress indicator for model downloads
- Document offline mode: pre-download models or mount them
- Implement retry logic for network failures

## Sources

### Primary (HIGH confidence)

- **js-tiktoken npm package** - Verified current version 1.0.20, API documentation, usage patterns
  - https://www.npmjs.com/package/js-tiktoken
- **@anthropic-ai/tokenizer GitHub** - Official repository, documented limitations for Claude 3+
  - https://github.com/anthropics/anthropic-tokenizer-typescript
- **@huggingface/transformers API docs** - Official tokenizers API reference, AutoTokenizer usage
  - https://huggingface.co/docs/transformers.js/api/tokenizers

### Secondary (MEDIUM confidence)

- **ai-tokenizer GitHub** - Verified performance benchmarks, accuracy tables, usage examples
  - https://github.com/coder/ai-tokenizer
- **Transformers.js v3 announcement** - Verified WebGPU support, 120+ architectures, Node.js compatibility
  - https://huggingface.co/blog/transformersjs-v3 (via search)
- **Tokenization accuracy benchmarks** - Multiple sources confirming 90-95% accuracy targets
  - https://github.com/johannschopplich/tokenx (94% accuracy benchmark)
  - https://medium.com/@elfee/predictoken-fast-local-token-count-prediction (<10% error margin)

### Tertiary (LOW confidence)

- WebSearch results for general tokenization patterns (marked for validation)
- Community discussions about Claude 3+ tokenization workarounds
- Memory management patterns for large file processing in JavaScript

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified from official npm/GitHub sources with current versions
- Architecture: HIGH - Based on documented APIs and established patterns from official sources
- Pitfalls: HIGH - Claude limitation is explicitly documented; memory issues are well-known JavaScript patterns
- Hugging Face integration: MEDIUM - API verified but edge cases (caching, offline mode) need implementation testing
- Performance characteristics: MEDIUM - Benchmarks from ai-tokenizer repo, but real-world performance needs validation

**Research date:** 2026-01-21
**Valid until:** 2026-03-21 (60 days - tokenizer ecosystem moves fast but core libraries are stable)
