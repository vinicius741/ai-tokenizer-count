# Feature Landscape: EPUB Tokenizer Web UI

**Domain:** EPUB tokenization Web UI with data visualization and token budget calculation
**Researched:** 2026-01-22
**Overall confidence:** HIGH

## Executive Summary

Based on research of modern web UI patterns, React data visualization libraries, and token budget calculator tools, the feature landscape for the v2.0 Web UI is clear. **Table stakes** for EPUB tokenization web UIs include data visualization (bar charts, scatter plots), token budget calculator, file upload interfaces, and real-time processing feedback. **Differentiators** include server-side folder browsing, drag-and-drop EPUB upload, and multi-tokenizer comparison visualization. **Anti-features** to avoid include authentication complexity, cloud storage integration, and real-time websockets for progress (SSE/polling sufficient).

## Table Stakes (Must Have)

Features users expect in any modern web-based EPUB tokenization tool. Missing these makes the UI feel incomplete or broken.

### Data Visualization

- **Bar charts for token counts across books** - Horizontal bar chart showing token counts per EPUB
  - Complexity: Medium
  - Why expected: Users need visual comparison of token costs across their library. All token calculator tools provide visual representation. Bar charts are standard for categorical data (EPUB titles) with numerical values (token counts)
  - Implementation: Use shadcn/ui + Recharts integration (pre-built components available)
  - Expected behavior:
    - X-axis: Token count (sortable ascending/descending)
    - Y-axis: EPUB titles (truncated with hover for full title)
    - Color coding by tokenizer (GPT-4, Claude, HF models)
    - Tooltip on hover showing exact counts, word count, file metadata
    - Click to highlight corresponding row in results table

- **Scatter plots for word vs token counts** - X/Y plot showing tokenization efficiency
  - Complexity: Medium
  - Why expected: Users want to understand tokenization density (words vs tokens ratio). Reveals which books are "expensive" to tokenize. Standard in data visualization toolkits
  - Implementation: Recharts ScatterChart with responsive design
  - Expected behavior:
    - X-axis: Word count
    - Y-axis: Token count
    - Each point = one EPUB
    - Color/shape coding by tokenizer
    - Trend line showing average tokenization ratio
    - Tooltip: title, word count, token count, ratio
    - Zoom/pan for large datasets (50+ EPUBs)
    - Click to show EPUB details

- **Results table with sorting/filtering** - Tabular display alongside charts
  - Complexity: Low
  - Why expected: Users need precise numbers, not just visuals. Tables complement charts
  - Implementation: shadcn/ui Table component with React state for sorting/filtering
  - Expected behavior:
    - Columns: Title, Author, Words, Tokens (per tokenizer), File Path
    - Sortable by any column (ascending/descending)
    - Filter by title/author text search
    - Filter by token count range slider
    - Row selection for comparison
    - Export to CSV button

### Token Budget Calculator

- **"I have X tokens → which books fit?" calculator** - Inverse knapsack problem solver
  - Complexity: High
  - Why expected: Users have token limits (context windows) and want to know which books fit. Core value proposition for cost planning. Existing tools like [tokencalculator.ai](https://tokencalculator.ai/) and [LiteLLM Pricing Calculator](https://docs.litellm.ai/docs/proxy/pricing_calculator) provide budget planning
  - Implementation: Algorithmic solver with React form input + results display
  - Expected behavior:
    - Input: Token budget (number input with presets: 32K, 128K, 200K)
    - Input: Tokenizer selection (dropdown: GPT-4, Claude, custom)
    - Input: Optimization strategy (checkboxes):
      - Maximize book count (greedy: smallest books first)
      - Maximize total words (knapsack: maximize value within budget)
      - Must include specific books (multi-select from results)
    - Output: Selected books list with checkbox UI
    - Display: Total tokens used (progress bar), Remaining tokens
    - Display: Total books selected, Total word count
    - Export: Copy book list to clipboard, Download JSON
    - Validation: Error if budget < smallest single book
    - Persistence: Save budget to localStorage for session continuity

- **Cost estimation display** - Show dollar cost equivalence
  - Complexity: Low
  - Why expected: Users care about bottom-line costs. Tools like [AI Token Calculator](https://tokencalculator.ai/) and [DocsBot Calculator](https://docsbot.ai/tools/gpt-openai-api-pricing-calculator) provide cost conversion
  - Implementation: Static pricing lookup table + calculation
  - Expected behavior:
    - Display estimated cost based on token count
    - Pricing per provider (OpenAI, Anthropic, Google Gemini 2026)
    - Link to official pricing pages
    - Note: "Estimates only, actual costs may vary"

### File Upload & Processing

- **Upload existing results.json files** - Load previous processing results
  - Complexity: Low
  - Why expected: Users process EPUBs via CLI, then want to visualize in UI. Avoids reprocessing
  - Implementation: HTML file input + JSON validation + React state hydration
  - Expected behavior:
    - Drag-and-drop zone (shadcn/ui Dropzone component)
    - File picker button (click to browse)
    - Validation: JSON schema validation, error display if invalid
    - Display: File metadata (processed_at, tokenizer list, EPUB count)
    - Load: Hydrate all visualizations with uploaded data
    - Clear button to reset to fresh state

- **Run EPUB processing from UI** - Trigger server-side EPUB analysis
  - Complexity: High
  - Why expected: Web UI should be self-contained, not just a viewer
  - Implementation: React form → Node.js API endpoint → CLI orchestrator → SSE progress
  - Expected behavior:
    - Input: EPUB folder path (server-side file browser, see below)
    - Input: Tokenizer selection (multi-select with search, like CLI `--tokenizers`)
    - Input: Max MB limit (number input, default 500)
    - Button: "Process EPUBs" (disabled until folder selected)
    - Progress: Real-time progress bar (current/total EPUBs)
    - Progress: Per-EPUB status (Processing: book.epub 50%)
    - Progress: ETA calculation (remaining EPUBs × avg time)
    - Results: Auto-load visualizations on completion
    - Error display: Non-blocking errors (EPUBs skipped) vs fatal errors
    - Cancel button: Stop processing mid-run

### Server-Side File System

- **Server-side folder selection for EPUBs** - Browse server filesystem from UI
  - Complexity: High
  - Why expected: Users store EPUBs in various folders. Hardcoding paths breaks workflows. Server-side file browser is standard pattern (see [Backend.ai vfolder docs](https://webui.docs.backend.ai/en/latest/vfolder/vfolder.html), [ownCloud WebUI](https://doc.owncloud.com/server/next/classic_ui/files/webgui/navigating.html))
  - Implementation: Node.js fs API → REST endpoints → React tree component
  - Expected behavior:
    - Display: Directory tree starting from server root or configurable base path
    - Navigation: Click folder to expand/collapse, Click to select
    - Display: EPUB count in each folder (badge: "12 EPUBs")
    - Display: EPUB files in selected folder (list view)
    - Breadcrumbs: Current path with clickable navigation
    - Up button: Navigate to parent directory
    - Quick filters: Show only folders with EPUBs
    - Refresh button: Reload filesystem state
    - Permission handling: Hide inaccessible folders, display error toast
    - Path input: Auto-complete for typing paths directly
    - Selection: Highlight selected folder, show in "Ready to process: /path/to/folder"

### Tokenizer Selection Interface

- **CLI tokenizer selection in UI** - Multi-select with search for tokenizer models
  - Complexity: Medium
  - Why expected: Power users want to run multiple tokenizers in one batch. CLI supports `--tokenizers gpt4,claude,hf:model`, UI should match
  - Implementation: Multi-select dropdown with search + HF model discovery integration
  - Expected behavior:
    - Preset tokenizers (checkboxes): GPT-4, Claude (pre-selected by default)
    - Hugging Face model selector (combobox):
      - Search input: Type to filter models
      - Display: Popular models list (from CLI `list-models` command)
      - Display: Model architecture badges (BERT, Llama, etc.)
      - Display: Tokenizer vocabulary size
      - Add button: Add selected model to run list
    - Selected models display: Tag list with remove buttons
    - Model info link: Link to Hugging Face model card
    - Validation: Error if no tokenizer selected
    - History: Remember last used tokenizers in localStorage

### UI/UX Patterns

- **Responsive layout** - Works on desktop and tablet
  - Complexity: Medium
  - Why expected: Modern web standard. Users may use tablets for reference
  - Implementation: Tailwind CSS responsive utilities (mobile-first approach)
  - Expected behavior:
    - Desktop (1024px+): Side-by-side charts and table
    - Tablet (768px-1024px): Stacked layout with collapsible sidebar
    - Mobile (<768px): Single column, horizontal scroll for charts
    - Touch targets: Minimum 44×44px for buttons

- **Loading states** - Skeleton screens during data fetch
  - Complexity: Low
  - Why expected: Perceived performance. Prevents "broken" feel during slow operations
  - Implementation: shadcn/ui Skeleton component with conditional rendering
  - Expected behavior:
    - Charts: Skeleton bars/points during initial load
    - Table: Skeleton rows during data fetch
    - Buttons: Spinner + disabled state during async operations
    - Timeout: Show error toast after 30s without response

- **Error boundaries** - Graceful error handling
  - Complexity: Low
  - Why expected: React best practice. Prevents white screen of death
  - Implementation: React ErrorBoundary component with fallback UI
  - Expected behavior:
    - Catch: Component rendering errors, async errors
    - Display: Friendly error message with retry button
    - Logging: Send error stack to console (no telemetry for localhost)
    - Recovery: Retry button re-attempts failed operation

## Differentiators

Features that set this Web UI apart from competitors. Not strictly required, but provide competitive advantage and user delight.

### Server-Side File System Browser

- **Folder tree with EPUB counts** - Smart filesystem browser
  - Complexity: High
  - Why it matters: Users don't remember exact paths. Showing "12 EPUBs" badge helps navigation. No existing EPUB tool provides this
  - Implementation: Recursive directory scan with EPUB counting, cached in memory
  - UX delight: One-click navigation to EPUB-rich folders

### Drag-and-Drop EPUB Upload

- **Direct EPUB file upload** - Bypass server filesystem entirely
  - Complexity: Medium
  - Why it matters: Some users prefer uploading files directly. Useful for one-off analysis. Complements server-side browsing
  - Implementation: shadcn/ui Dropzone with multipart/form-data, server saves to temp dir
  - UX patterns from: [sadmann7/file-uploader](https://github.com/sadmann7/file-uploader), [shadcn Dropzone](https://www.shadcn.io/components/forms/dropzone)
  - Expected behavior:
    - Drag EPUB files onto drop zone
    - Display file list with file size, remove button
    - Upload progress bar per file
    - Validation: EPUB file extension, file size limit (e.g., 100MB)
    - Server: Save to temp folder, process, return results

### Multi-Tokenizer Comparison

- **Side-by-side tokenizer comparison** - Visual diff of tokenization results
  - Complexity: Medium
  - Why it matters: Users want to see "Claude uses 15% more tokens than GPT-4 for this book". No existing tool provides visual comparison
  - Implementation: Paired bar chart, grouped by EPUB
  - Expected behavior:
    - Display: Bar chart with grouped bars (GPT-4 vs Claude) per EPUB
    - Highlight: Color code largest differences (green = fewer tokens, red = more)
    - Tooltip: Show percentage difference on hover
    - Export: Download comparison table as CSV

### Token Budget Optimizer

- **Advanced knapsack solver** - Beyond greedy maximization
  - Complexity: High
  - Why it matters: Greedy "smallest first" is simple but suboptimal. True knapsack solver maximizes value (words) within budget
  - Implementation: Dynamic programming algorithm with React UI for strategy selection
  - Expected behavior:
    - Algorithm selector: Greedy (fast) vs DP (optimal, O(n×budget) complexity)
    - Performance: Progressive enhancement for large datasets (>100 books)
    - Display: Show "Optimized solution saves X tokens vs greedy"
    - Use case: Researchers maximizing reading material within context window

### Session Persistence

- **Auto-save results to localStorage** - Survive page refresh
  - Complexity: Low
  - Why it matters: Users accidentally close tabs. Losing results is frustrating. No existing EPUB tool does this
  - Implementation: React useEffect hook, serialize results to localStorage on change
  - Expected behavior:
    - Save: After processing completes, save results to localStorage
    - Load: On page load, check for saved results, prompt to restore
    - Clear: "New Session" button clears saved data
    - Limit: 5MB localStorage limit, show warning if exceeded

## Anti-Features (Do NOT Build)

Features to explicitly avoid. Common mistakes in this domain.

- **User authentication** - Do NOT implement login/signup
  - Why avoid: Scope is localhost-only. Authentication adds complexity (passwords, sessions, security). Already decided in requirements
  - Alternative: Bind to 127.0.0.1 only, document "for local use only"

- **Cloud storage integration** - Do NOT add Dropbox/Google Drive support
  - Why avoid: OAuth complexity, API rate limits, privacy concerns. Users can download from cloud storage and upload to UI
  - Alternative: Local file system browser and direct upload are sufficient

- **Real-time websocket progress** - Do NOT use websockets for progress updates
  - Why avoid: Overkill for progress updates. Adds server complexity. SSE (Server-Sent Events) or polling is simpler
  - Alternative: Use SSE for processing progress, or short-poll (1s interval) if SSE unavailable

- **EPUB editing/modification** - Do NOT add EPUB content editing
  - Why avoid: Tool is analyzer, not editor. Adds massive scope (EPUB rewriting, ZIP repackaging)
  - Alternative: Link to external EPUB editors (Sigil, Calibre) in help text

- **Multi-user collaboration** - Do NOT add sharing, comments, or multi-user features
  - Why avoid: Localhost-only scope. Requires backend database, authentication, conflict resolution
  - Alternative: Export results to JSON/CSV, users share files manually

- **Background processing queue** - Do NOT add job queue for later processing
  - Why avoid: Complexity (queue persistence, worker management). Users want immediate results
  - Alternative: Process synchronously, show progress bar, allow cancellation

- **Custom tokenizer upload** - Do NOT allow uploading custom tokenizer.json files in v2
  - Why avoid: Security (arbitrary file upload), validation complexity. CLI already supports `hf:model` syntax
  - Alternative: Use Hugging Face model selector, all models vetted by HF community

- **Database persistence** - Do NOT add SQLite/PostgreSQL for results storage
  - Why avoid: Overkill for local tool. File-based JSON storage is simpler and sufficient
  - Alternative: Save results.json files, use server file browser to load previous results

- **Docker/containerization** - Do NOT containerize for v2
  - Why avoid: Adds deployment complexity. npm start is sufficient for local development
  - Alternative: Document npm install + npm start in README

## Feature Dependencies

```
Data Visualization
├── Bar Charts
│   ├── Tokenizer selection (completeness: data available)
│   └── EPUB processing (completeness: data generated)
├── Scatter Plots
│   ├── Tokenizer selection
│   └── EPUB processing
└── Results Table
    ├── Tokenizer selection
    └── EPUB processing

Token Budget Calculator
├── Tokenizer selection (which tokenizer's costs to use)
└── EPUB processing (which books are available to select)

File Upload
├── results.json Upload (independent, can run standalone)
└── EPUB Processing from UI
    ├── Server-side folder browser
    ├── Tokenizer selection
    └── Progress feedback system

Server-side File System
└── EPUB Processing from UI (dependency: need to select folder)

Tokenizer Selection Interface
├── Data Visualization (shows results from selected tokenizers)
└── EPUB Processing from UI (runs selected tokenizers)
```

**Critical path:**
1. Server backend + API endpoints (foundation for all UI features)
2. Tokenizer selection interface (needed by all downstream features)
3. EPUB processing execution (generates data for visualization)
4. Data visualization components (display processed data)
5. Token budget calculator (uses processed data for optimization)

**Independent tracks:**
- results.json upload can be built in parallel with server-side folder browser
- Chart components can be built with mock data before real processing is ready

## MVP Recommendation

For v2.0 MVP, prioritize table stakes that enable core Web UI workflow:

**Phase 1 (Foundation):**
1. React + shadcn/ui project setup
2. Server backend (Express/Fastify) with CORS
3. API endpoints: health, list-models, process-epubs
4. Tokenizer selection interface
5. results.json upload + visualization hydration

**Phase 2 (Core Features):**
6. Server-side folder browser (basic tree navigation)
7. EPUB processing execution (API call + SSE progress)
8. Bar charts (token counts per EPUB)
9. Results table with sorting

**Phase 3 (Visualization + Calculator):**
10. Scatter plots (word vs token density)
11. Token budget calculator (greedy maximization)
12. Cost estimation display
13. Error boundaries + loading states

**Defer to post-MVP:**
- Drag-and-drop EPUB upload (differentiator, not table stakes)
- Multi-tokenizer comparison visualization (can iterate on bar charts)
- Advanced knapsack solver (greedy is sufficient for MVP)
- Session persistence (nice-to-have, not critical)

## Web UI-Specific Challenges

Web UI development has unique complexities that must be handled:

- **CORS configuration** - Browser security blocks localhost API calls without proper headers
  - How to handle: Configure Express/Fastify with CORS middleware, allow credentials, set origin explicitly

- **Long-running processing timeouts** - Browser HTTP requests timeout after 2-5 minutes
  - How to handle: Return job ID immediately, use SSE or polling for progress updates, or increase server timeout

- **Large file uploads** - EPUBs can be 50MB+, browsers may timeout
  - How to handle: Chunked uploads with progress tracking, or limit upload size (e.g., 100MB max per file)

- **Memory limits in browser** - 1000+ EPUBs results can crash browser tabs
  - How to handle: Pagination for results table (show 50 at a time), virtualization for large lists, aggregate charts for large datasets

- **React state complexity** - Multiple interdependent UI states (processing, results, errors)
  - How to handle: Use state machines (XState) or careful reducer patterns, separate concerns (processing state vs results state)

- **shadcn/ui installation** - Requires manual component copying, not npm install
  - How to handle: Use `npx shadcn-ui@latest add [component]` command, commit components to repo, customize as needed

- **Recharts responsive behavior** - Charts can overflow on small screens
  - How to handle: Wrap charts in ResponsiveContainer component, set min-width, test on tablet/mobile

- **localStorage quota** - 5MB limit, large results.json files can exceed
  - How to handle: Check localStorage size before save, show warning if exceeded, fall back to session storage or file-only persistence

## Sources

### Data Visualization Libraries
- [Recharts Official Website](https://recharts.org/) - HIGH confidence (official documentation)
- [Simple Scatter Chart Example - Recharts](https://recharts.github.io/en-US/examples/SimpleScatterChart/) - HIGH confidence (official examples)
- [Create charts using Recharts - refine.dev](https://refine.dev/blog/recharts/) (Nov 2024) - MEDIUM confidence (tutorial)
- [Best React chart libraries 2025 - LogRocket](https://blog.logrocket.com/best-react-chart-libraries-2025/) (Apr 2025) - MEDIUM confidence (comparison)

### shadcn/ui Components
- [6 Free shadcn/ui File Upload Components - blocks.so](https://blocks.so/file-upload) - MEDIUM confidence (component gallery)
- [File Uploader built with shadcn/ui - sadmann7](https://github.com/sadmann7/file-uploader) - MEDIUM confidence (open source example)
- [Dropzone - shadcn/ui](https://www.shadcn.io/components/forms/dropzone) - HIGH confidence (official component)

### Token Budget Calculators
- [AI Token Calculator - tokencalculator.ai](https://tokencalculator.ai/) - MEDIUM confidence (competitor analysis)
- [LiteLLM Pricing Calculator](https://docs.litellm.ai/docs/proxy/pricing_calculator) - MEDIUM confidence (feature reference)
- [Token Usage Calculator - Ghost](https://latitude-blog.ghost.io/blog/token-usage-calculator-ai-cost-planning/) (Oct 2025) - MEDIUM confidence (UI patterns)
- [Google Gemini API Pricing 2026 - Metacto](https://www.metacto.com/blogs/the-true-cost-of-google-gemini-a-guide-to-api-pricing-and-integration) - LOW confidence (pricing reference, verify official)

### File Upload Best Practices
- [How to Handle Large File Uploads - dev.to](https://dev.to/leapcell/how-to-handle-large-file-uploads-without-losing-your-mind-3dck) (Jan 2025) - MEDIUM confidence (best practices)
- [MDN: `<input type="file">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) (Aug 2025) - HIGH confidence (official documentation)
- [10 File Upload System Features 2025 - Porto Theme](https://www.portotheme.com/10-file-upload-system-features-every-developer-should-know-in-2025/) (May 2025) - MEDIUM confidence (feature checklist)

### Server-Side File System
- [Using node.js File System from browser - Stack Overflow](https://stackoverflow.com/questions/29762282/using-node-jss-file-system-functions-from-a-browser) - MEDIUM confidence (architecture discussion)
- [Navigating the WebUI - ownCloud](https://doc.owncloud.com/server/next/classic_ui/files/webgui/navigating.html) - MEDIUM confidence (UX reference)
- [Data Page - Backend.ai](https://webui.docs.backend.ai/en/latest/vfolder/vfolder.html) - MEDIUM confidence (folder browsing patterns)

### React + Node.js Architecture
- [A Beginner's Guide to Server-Side Web Development with Node.js - Bitsrc](https://blog.bitsrc.io/a-beginners-guide-to-server-side-web-development-with-node-js-17385da09f93) - MEDIUM confidence (architecture patterns)
- [Node.js server without a framework - MDN](https://developer.mozilla.org/en-US/docs/Web/learn_web_development/Extensions/Server-side/Node_server_without_framework) (Oct 2025) - HIGH confidence (official guide)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Data visualization features | HIGH | Based on Recharts official docs and shadcn/ui examples |
| Token budget calculator patterns | MEDIUM | Based on competitor tools (tokencalculator.ai, LiteLLM), verify pricing accuracy |
| File upload interfaces | HIGH | Based on MDN documentation and shadcn/ui components |
| Server-side file browser | MEDIUM | Based on Backend.ai and ownCloud docs, may need iteration |
| shadcn/ui integration | HIGH | Official components and community examples available |
| Anti-features | HIGH | Based on project scope constraints (localhost-only) |

## Gaps to Address

- **Pricing data accuracy**: Token pricing for GPT-4, Claude, Gemini changes frequently. Need to verify 2026 pricing before implementing cost calculator
- **SSE vs polling trade-off**: Need to spike test Server-Sent Events vs polling for processing progress. SSE is cleaner but may have browser compatibility quirks
- **Large dataset performance**: Mock data needed to test chart performance with 1000+ EPUBs. May need aggregation strategies
- **Folder browser caching**: Large directory trees are slow to scan. Need in-memory caching strategy with cache invalidation
- **shadcn/ui customization**: Components need customization for this use case. Plan time for styling tweaks
