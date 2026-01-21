# Feature Landscape: EPUB Tokenizer CLI Tools

**Domain:** EPUB tokenization CLI tools
**Researched:** 2026-01-21
**Overall confidence:** HIGH

## Executive Summary

Based on research of existing EPUB processing tools and token counting utilities, the feature landscape is clear. **Table stakes** for EPUB tokenization tools include batch processing, multiple tokenizer support, progress indicators, and robust error handling. **Differentiators** include cost estimation, batch optimization, custom tokenizer support, and per-chapter analysis. **Anti-features** to avoid include DRMed EPUB processing, text extraction to files (bloat), and interactive prompts that break automation.

## Table Stakes (Must Have)

Features users expect in any EPUB tokenization tool. Missing these makes the tool feel incomplete or broken.

### EPUB Processing

- **Batch folder processing** - Process all EPUBs in a directory at once
  - Complexity: Low
  - Why expected: Users have collections of EPUBs, not single files. Competitors like [epub-wordcount](https://github.com/xavdid/epub-wordcount) support directory processing: `word-count directory/of/books`

- **Individual file processing** - Process specific EPUB files by path
  - Complexity: Low
  - Why expected: Power users need granular control. Single-file mode is the foundation, batch is convenience

- **EPUB 2.0.1 and 3.0 support** - Handle both legacy and modern EPUB specifications
  - Complexity: Medium
  - Why expected: EPUBs come in both formats. Tools like [epub-utils](https://github.com/ernestofgonzalez/epub-utils) explicitly support both specifications

- **Text extraction with noise filtering** - Extract readable text while excluding frontmatter/backmatter
  - Complexity: High
  - Why expected: Users want accurate counts of actual content, not copyright pages. [epub-wordcount](https://github.com/xavdid/epub-wordcount) notes this challenge: "hard to skip over the reviews, copyright, etc." with ~500 word margin of error

- **Rich metadata extraction** - Pull title, author, language, publisher from EPUB
  - Complexity: Medium
  - Why expected: Context matters. [epub-utils](https://github.com/ernestofgonzalez/epub-utils) provides Dublin Core metadata extraction as a core feature

### Tokenization

- **Multiple tokenizer support** - Support GPT-4 (cl100k_base), Claude, and custom tokenizers
  - Complexity: Medium
  - Why expected: Different LLM providers use different tokenizers. Users compare costs across providers. Tools like [tiktoken-cli](https://github.com/oelmekki/tiktoken-cli) offer model selection via `--model` flag

- **Custom tokenizer specification** - Allow users to specify any Hugging Face tokenizer
  - Complexity: Medium
  - Why expected: Users work with diverse models (Llama, Mistral, etc.). Hugging Face tokenizers library supports arbitrary tokenizer loading

- **Accurate word counting** - Provide word counts alongside token counts
  - Complexity: Low
  - Why expected: Word counts are familiar reference points. All EPUB analysis tools provide this ([epub-wordcount](https://github.com/xavdid/epub-wordcount), [epub-utils](https://github.com/ernestofgonzalez/epub-utils))

### CLI Experience

- **Progress indicators** - Show processing status for long-running operations
  - Complexity: Low
  - Complexity notes: Use progress bars for batch operations (X of Y pattern), spinners for individual EPUBs
  - Why expected: Silent processing feels broken. [Evil Martians CLI UX guide](https://evilmartians.com/chronicles/cli-ux-best-practices-3-patterns-for-improving-progress-displays) emphasizes progress displays as "absolutely essential" for long-running processes

- **Error logging to file** - Write detailed error information to `errors.log`
  - Complexity: Low
  - Why expected: Console output scrolls away. Users need post-mortem debugging info. Already in project requirements

- **Continue-on-error behavior** - Don't abort entire batch on single EPUB failure
  - Complexity: Medium
  - Why expected: Large collections shouldn't fail completely due to one bad file. Already in project requirements

- **Configurable input/output paths** - Allow users to specify custom folders via CLI args
  - Complexity: Low
  - Why expected: Users have existing workflows. Hardcoded paths break automation. Already in project requirements

### Output

- **JSON output format** - Machine-readable results for downstream processing
  - Complexity: Low
  - Why expected: JSON is parseable, scriptable, and integrates with other tools. Most modern CLIs output JSON

- **Rich result metadata** - Include file_path, processed_at, epub_metadata alongside counts
  - Complexity: Low
  - Why expected: Context is crucial. Users need to know which EPUB produced which result and when. Already in project requirements

- **One JSON file per EPUB** - Atomic output per input file
  - Complexity: Low
  - Why expected: Easier to process individual results, safer writes (partial failure doesn't corrupt all results). Already in project requirements

## Differentiators

Features that set this tool apart. Not strictly required, but provide competitive advantage and user delight.

- **Cost estimation calculator** - Convert token counts to estimated API costs for major providers
  - Complexity: Medium
  - Why it matters: Users care about bottom-line costs, not abstract token counts. Displaying "$X to process with GPT-4, $Y with Claude" makes the tool actionable. No existing EPUB tool does this

- **Batch optimization suggestions** - Recommend most cost-effective tokenizer/model combination
  - Complexity: High
  - Why it matters: Helps users make decisions. "Process with Mistral-7B to save 60% vs GPT-4" is valuable insight

- **Per-chapter breakdown** - Show token counts per chapter/section
  - Complexity: High
  - Why it matters: Users may want to process chapters individually (context window constraints). No existing EPUB tool provides this granularity

- **Custom tokenizer vocabulary** - Support loading custom-trained tokenizers
  - Complexity: High
  - Why it matters: Power users train domain-specific tokenizers. Supporting custom tokenizers future-proofs the tool

- **Parallel processing** - Process multiple EPUBs concurrently (with user control)
  - Complexity: High
  - Why it matters: Large EPUB collections take time. Parallel processing with `--jobs` flag (like `make`) speeds up batch operations

- **Summary statistics** - Aggregate stats across batch (total tokens, average per EPUB, etc.)
  - Complexity: Medium
  - Why it matters: Users processing collections want overview: "27 EPUBs, 1.2M total tokens, ~44K avg per EPUB"

- **Diff mode** - Compare tokenization results between different tokenizers
  - Complexity: Medium
  - Why it matters: Shows users how tokenizer choice impacts their content. "Claude tokenizes this 15% more densely than GPT-4"

## Anti-Features (Do NOT Build)

Features to explicitly avoid. Common mistakes in this domain.

- **DRM handling** - Do NOT attempt to process DRMed EPUBs
  - Why avoid: Legal complexity, user expectation mismatch. [epub-wordcount](https://github.com/xavdid/epub-wordcount) has `--ignore-drm` flag with warning: "Might cause weird results if the actually _does_ have DRM." DRM handling is outside scope

- **Text file export** - Do NOT extract EPUB text to `.txt` files
  - Why avoid: Bloat. Users only want token counts, not extracted text. Export is separate concern. If users want text, they'd use dedicated extraction tools

- **Interactive prompts** - Do NOT ask for input mid-execution
  - Why avoid: Breaks automation. CLI should be scriptable. Use flags for configuration, not prompts. Already decided in requirements

- **EPUB modification** - Do NOT write back to EPUB files
  - Why avoid: Tool is read-only analyzer. Modifying source files is dangerous outside explicit user intent. Already in "Out of Scope"

- **Real-time processing/watch mode** - Do NOT auto-process new EPUBs added to folder
  - Why avoid: Adds complexity, background process management. Manual execution is simpler and explicit. Already in "Out of Scope"

- **GUI or web interface** - Do NOT build visual interface
  - Why avoid: Out of scope for v1, CLI focus. Already in "Out of Scope"

## EPUB-Specific Challenges

EPUB processing has unique complexities that must be handled:

- **No standard table of contents representation** - EPUB lacks programmatic TOC, making it hard to skip frontmatter/backmatter automatically
  - How to handle: Use heuristics (spine order, common patterns like "copyright", "acknowledgments"). Accept ~500 word margin of error as [epub-wordcount](https://github.com/xavdid/epub-wordcount) does

- **XHTML vs HTML content** - EPUB 2 uses XHTML, EPUB 3 may use HTML5
  - How to handle: Support both parsing modes. Use libraries that handle content-type detection

- **Embedded images and fonts** - EPUBs include binary assets that shouldn't be tokenized
  - How to handle: Parse only spine items (reading order), skip manifest resources (images, fonts, CSS)

- **ZIP format quirks** - EPUB is ZIP with specific structure (`mimetype` file must be uncompressed first)
  - How to handle: Use EPUB-specific parsing library, not generic ZIP extraction

- **MacOS "fake EPUBs"** - Dragging EPUB from Apple Books creates folder with `.epub` extension
  - How to handle: Detect and reject folders, or provide fix command as [epub-wordcount](https://github.com/xavdid/epub-wordcount) documents

- **Character encoding variations** - EPUBs may use different encodings despite UTF-8 specification
  - How to handle: Robust encoding detection/fallback, log warnings for non-standard encodings

## Feature Dependencies

```
EPUB parsing → Text extraction → Word counting
                             → Token counting (multiple tokenizers)
                             → Metadata extraction

Progress indicators → Batch processing

Error logging → Continue-on-error behavior

Configurable paths → Batch folder processing
```

**Critical path:**
1. EPUB parsing (foundational)
2. Text extraction (depends on parsing)
3. Word/Token counting (depends on extraction)
4. Output generation (depends on counting)

**Parallelizable:**
- Multiple tokenizer application (once text is extracted)
- Multiple EPUB processing (batch mode)

## MVP Recommendation

For MVP, prioritize table stakes that enable core workflow:

**Phase 1 (MVP):**
1. EPUB parsing (EPUB 2.0.1 and 3.0)
2. Text extraction with basic noise filtering
3. Word counting
4. Token counting (GPT-4 + Claude presets)
5. Batch folder processing
6. Progress indicators (X of Y pattern)
7. JSON output with metadata
8. Error logging + continue-on-error

**Defer to post-MVP:**
- Cost estimation (differentiator, can add later)
- Per-chapter breakdown (complexity high, not table stakes)
- Parallel processing (optimization, not required for MVP)
- Custom tokenizer loading (power user feature, not table stakes)

## Sources

### EPUB Processing Tools
- [xavdid/epub-wordcount](https://github.com/xavdid/epub-wordcount) - CLI for counting words in EPUB files
- [ernestofgonzalez/epub-utils](https://github.com/ernestofgonzalez/epub-utils) - Python library and CLI for inspecting EPUB files

### Tokenization Tools
- [oelmekki/tiktoken-cli](https://github.com/oelmekki/tiktoken-cli) - CLI wrapper around OpenAI's tiktoken
- [tokens-cli on PyPI](https://pypi.org/project/tokens-cli/) - Simple token counting tool
- [token-counter-cli on PyPI](https://libraries.io/pypi/token-counter-cli) - Fast token counting CLI
- [huggingface/tokenizers](https://github.com/huggingface/tokenizers) - Fast state-of-the-art tokenizers (Rust)

### CLI Best Practices
- [Evil Martians: CLI UX best practices for progress displays](https://evilmartians.com/chronicles/cli-ux-best-practices-3-patterns-for-improving-progress-displays) - Patterns for spinners, X of Y, and progress bars
- [Error Handling in CLI Tools (Medium)](https://medium.com/@czhoudev/error-handling-in-cli-tools-a-practical-pattern-thats-worked-for-me-6c658a9141a9) - Practical error handling patterns

### Token Counting Documentation
- [OpenAI Cookbook: How to count tokens with tiktoken](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken/) - Official token counting guide
- [Claude Docs: Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting) - Claude's tokenization docs
- [AWS Bedrock: Count tokens](https://docs.aws.amazon.com/bedrock/latest/userguide/count-tokens.html) - Pre-calculation best practices

### Batch Processing Guidance
- [OpenAI Best Practices: Batch requests when possible](https://tonylixu.medium.com/openai-best-practices-of-using-tokens-6709e1df6cc5) - Token-efficient batch processing
- [Azure OpenAI: Batch deployments](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/batch?view=foundry-classic) - Large file batch recommendations

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| EPUB processing features | HIGH | Based on analysis of epub-wordcount, epub-utils (both actively maintained, clear feature sets) |
| Tokenization features | HIGH | Based on tiktoken-cli, tokens-cli, and official OpenAI/Claude documentation |
| CLI UX patterns | HIGH | Based on Evil Martians CLI UX guide (authoritative source, current) |
| Anti-features | HIGH | Based on project scope and explicit "Out of Scope" decisions |
| EPUB challenges | HIGH | Based on epub-wordcount's documented limitations and EPUB spec quirks |
