# Architecture Research: Web UI Integration

**Domain:** EPUB Tokenizer Counter — Web UI with React + shadcn/ui
**Researched:** 2026-01-22
**Confidence:** MEDIUM

## System Overview

### Existing CLI Architecture (v1.0)

The current CLI tool follows a **pipeline architecture pattern**:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLI Layer                            │
│  Argument Parser → Config Builder → Progress Reporter       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     EPUB Processing Layer                    │
│  File Discovery → Parser → Text Extraction → Metadata       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Tokenization Engine                        │
│  Tokenizer Registry → Text Processor → Token Counter        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Output Layer                            │
│  JSON Serializer → File Writer → Result Aggregator          │
└─────────────────────────────────────────────────────────────┘
```

### Proposed Web UI Architecture (v2.0)

The Web UI adds a **client-server architecture layer** on top of existing components:

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Vite + TypeScript)                    │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐       │ │
│  │  │ Page Views │  │ Components │  │ Charts     │       │ │
│  │  │ (routes)  │  │ (shadcn/ui)│  │ (Recharts) │       │ │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘       │ │
│  │        │                │                │              │ │
│  │  ┌─────┴────────────────┴────────────────┴──────┐     │ │
│  │  │  State Management (TanStack Query + Zustand) │     │ │
│  │  └────────────────────┬─────────────────────────┘     │ │
│  └───────────────────────┼─────────────────────────────┘ │
└──────────────────────────┼───────────────────────────────┘
                           │ HTTP + SSE
                           │
┌──────────────────────────┼───────────────────────────────┐
│                          ▼                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              API Layer (Express.js)                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │ │
│  │  │ REST API │  │File Upload│  │SSE Progress     │  │ │
│  │  │ Routes   │  │(Multer)   │  │Streaming        │  │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────────────┘  │ │
│  └───────┼─────────────┼─────────────┼─────────────────┘ │
└──────────┼─────────────┼─────────────┼───────────────────┘
           │             │             │
           ▼             ▼             ▼
┌───────────────────────────────────────────────────────────┐
│                 Shared Business Logic                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ EPUB         │  │ Tokenizer    │  │ Output       │   │
│  │ Processing   │  │ Registry     │  │ Generation   │   │
│  │ (from CLI)   │  │ (from CLI)   │  │ (from CLI)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└───────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend Layer (NEW)

| Component | Responsibility | Implementation |
|-----------|----------------|-----------------|
| **React App** | Main application container with routing | Vite + React Router |
| **Page Views** | Route-level pages (Home, Process, Results, Settings) | React components |
| **UI Components** | Reusable UI elements (buttons, forms, cards) | shadcn/ui + Radix UI |
| **Chart Components** | Data visualization (bar charts, scatter plots) | Recharts |
| **State Management** | Server state caching + client state | TanStack Query + Zustand |
| **SSE Client** | Real-time progress updates from server | EventSource API |

### API Layer (NEW)

| Component | Responsibility | Implementation |
|-----------|----------------|-----------------|
| **Express Server** | HTTP server and API routing | Express.js |
| **REST API** | CRUD endpoints for processing, results, file system | Express Router |
| **File Upload Handler** | Multipart file upload processing | Multer middleware |
| **SSE Emitter** | Server-Sent Events for progress streaming | Custom SSE implementation |
| **Background Jobs** | Async EPUB processing queue | Worker threads or Bull queue |
| **Static File Server** | Serve React build output | Express static |

### Shared Business Logic (REUSE)

| Component | Current Location | Reuse Strategy |
|-----------|------------------|-----------------|
| **EPUB Discovery** | `src/file-discovery/scanner.ts` | Import in API layer |
| **EPUB Parser** | `src/epub/parser.ts` | Direct import |
| **Text Extraction** | `src/epub/text.ts` | Direct import |
| **Metadata Extraction** | `src/epub/metadata.ts` | Direct import |
| **Tokenizer Factory** | `src/tokenizers/index.ts` | Direct import |
| **Tokenizers** | `src/tokenizers/gpt.ts`, `claude.ts`, `huggingface.ts` | Direct import |
| **Error Handler** | `src/errors/handler.ts` | Adapt for API responses |
| **Parallel Processing** | `src/parallel/processor.ts` | Reuse for background jobs |

## Recommended Project Structure

### Monorepo Structure (Turborepo or Nx)

```
epub-tokenizer-counter/
├── apps/
│   ├── web/                    # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── pages/          # Route pages
│   │   │   ├── components/     # React components
│   │   │   ├── lib/            # API client, utilities
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   └── main.tsx        # Entry point
│   │   ├── public/             # Static assets
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   ├── middleware/     # Express middleware
│       │   ├── services/       # Business logic layer
│       │   ├── jobs/           # Background job processing
│       │   ├── sse/            # SSE implementation
│       │   └── server.ts       # Server entry point
│       ├── uploads/            # Temp file upload storage
│       ├── results/            # Generated results storage
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                 # Shared TypeScript code
│   │   ├── src/
│   │   │   ├── epub/           # EPUB processing (from current src/epub/)
│   │   │   ├── tokenizers/     # Tokenizers (from current src/tokenizers/)
│   │   │   ├── file-discovery/ # File scanning (from current src/file-discovery/)
│   │   │   ├── errors/         # Error handling (from current src/errors/)
│   │   │   ├── output/         # Output generation (from current src/output/)
│   │   │   ├── parallel/       # Parallel processing (from current src/parallel/)
│   │   │   └── types.ts        # Shared TypeScript types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ui/                     # Shared UI components (optional)
│       ├── src/
│       │   ├── components/     # Reusable React components
│       │   └── styles/         # Shared styles
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                # Root package.json
├── turbo.json                  # Turborepo configuration
└── tsconfig.json               # Root TypeScript config
```

### Alternative: Single-Repo Structure (Simpler)

If monorepo tooling adds too much complexity for a single-developer project:

```
epub-tokenizer-counter/
├── src/
│   ├── cli/                    # Existing CLI code (unchanged)
│   │   ├── index.ts
│   │   ├── commands/
│   │   └── progress.ts
│   │
│   ├── server/                 # NEW: Express API server
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Express middleware
│   │   ├── services/           # Business logic adapters
│   │   ├── jobs/               # Background processing
│   │   ├── sse.ts              # SSE utilities
│   │   └── server.ts           # Server entry point
│   │
│   ├── shared/                 # Existing business logic (refactored)
│   │   ├── epub/               # From src/epub/
│   │   ├── tokenizers/         # From src/tokenizers/
│   │   ├── file-discovery/     # From src/file-discovery/
│   │   ├── errors/             # From src/errors/
│   │   ├── output/             # From src/output/
│   │   └── parallel/           # From src/parallel/
│   │
│   └── types/                  # Shared TypeScript types
│       └── index.ts
│
├── web/                        # NEW: React frontend
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   ├── components/         # React components
│   │   ├── lib/                # API client
│   │   ├── hooks/              # Custom hooks
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── uploads/                    # NEW: File upload temp storage
├── results/                    # Existing: Results output
├── package.json
├── tsconfig.json
└── README.md
```

### Structure Rationale

- **Monorepo (Turborepo/Nx):** Best for scaling, clear separation, shared packages, but adds tooling complexity
- **Single-Repo:** Simpler for small projects, less configuration, easier to understand
- **Recommendation:** Start with single-repo structure, migrate to Turborepo if project grows

## Architectural Patterns

### Pattern 1: Shared Business Logic Library

**What:** Extract CLI business logic into a shared package that both CLI and API import

**When to use:** When multiple interfaces (CLI, API, future SDKs) need the same core functionality

**Trade-offs:**
- ✅ Pros: DRY, single source of truth, easier testing
- ❌ Cons: Requires careful API design, can introduce coupling

**Example:**
```typescript
// packages/shared/src/epub/parser.ts
export async function parseEpubFile(filePath: string): Promise<ParseResult> {
  // Existing implementation - unchanged
}

// apps/api/src/routes/process.ts
import { parseEpubFile } from '@epub-counter/shared';

router.post('/process', async (req, res) => {
  const result = await parseEpubFile(req.body.filePath);
  res.json(result);
});
```

### Pattern 2: API Adapter Layer

**What:** Create thin adapter functions that transform CLI outputs into API responses

**When to use:** When CLI output format doesn't match API response requirements

**Trade-offs:**
- ✅ Pros: Isolates API concerns, keeps shared code pure
- ❌ Cons: Additional layer to maintain

**Example:**
```typescript
// apps/api/src/services/epub-adapter.ts
import { processEpubsWithErrors } from '@epub-counter/shared';
import type { ProcessingResult } from '@epub-counter/shared';

export async function processEpubForApi(
  filePaths: string[],
  options: ProcessOptions
): Promise<ApiResponse> {
  // Call existing shared logic
  const cliResult: ProcessingResult = await processEpubsWithErrors(
    filePaths,
    false,
    options.outputDir,
    options.tokenizers,
    options.maxMb
  );

  // Transform CLI result to API response
  return {
    success: cliResult.successful.length,
    failed: cliResult.failed.length,
    total: cliResult.total,
    results: cliResult.successful.map(r => ({
      id: generateId(), // Add ID for UI
      filename: r.filename,
      wordCount: r.wordCount,
      // Map other fields...
    }))
  };
}
```

### Pattern 3: SSE for Real-Time Progress

**What:** Use Server-Sent Events to stream progress updates to the UI during long-running EPUB processing

**When to use:** For long-running operations where users need real-time feedback (10+ seconds)

**Trade-offs:**
- ✅ Pros: Simple HTTP-based, unidirectional (server→client), auto-reconnect
- ❌ Cons: Not supported in all browsers (but widely supported), one-way only

**Example:**
```typescript
// apps/api/src/sse/progress-emitter.ts
export class ProgressEmitter {
  private clients: Map<string, Response> = new Map();

  // Client connects to SSE stream
  addClient(jobId: string, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    this.clients.set(jobId, res);
  }

  // Send progress update
  emitProgress(jobId: string, progress: number, filename: string) {
    const client = this.clients.get(jobId);
    if (client) {
      client.write(`data: ${JSON.stringify({ progress, filename })}\n\n`);
    }
  }

  // Complete job
  complete(jobId: string, result: any) {
    const client = this.clients.get(jobId);
    if (client) {
      client.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
      client.end();
      this.clients.delete(jobId);
    }
  }
}

// apps/api/src/routes/process.ts
router.post('/process', async (req, res) => {
  const jobId = generateJobId();
  const emitter = new ProgressEmitter();

  // Set up SSE connection
  emitter.addClient(jobId, res);

  // Start background processing
  processEpubInBackground(files, options, {
    onProgress: (progress, filename) => {
      emitter.emitProgress(jobId, progress, filename);
    },
    onComplete: (result) => {
      emitter.complete(jobId, result);
    }
  });
});
```

**Client-side:**
```typescript
// web/src/hooks/useEpubProcessing.ts
export function useEpubProcessing() {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  const processEpubs = async (files: string[]) => {
    const response = await fetch('/api/process', {
      method: 'POST',
      body: JSON.stringify({ files })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const messages = text.split('\n\n');

      for (const msg of messages) {
        if (msg.startsWith('data: ')) {
          const data = JSON.parse(msg.slice(6));
          if (data.done) {
            return data.result;
          } else {
            setProgress(data.progress);
            setCurrentFile(data.filename);
          }
        }
      }
    }
  };

  return { processEpubs, progress, currentFile };
}
```

### Pattern 4: TanStack Query for Server State

**What:** Use TanStack Query for data fetching, caching, and synchronization

**When to use:** For all server interactions (fetching results, polling job status)

**Trade-offs:**
- ✅ Pros: Automatic caching, refetching, loading states, error handling
- ❌ Cons: Additional library, learning curve

**Example:**
```typescript
// web/src/hooks/useResults.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useResults() {
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      const res = await fetch('/api/results');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useProcessEpubs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));

      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch results
      queryClient.invalidateQueries({ queryKey: ['results'] });
    }
  });
}
```

## Data Flow

### Request Flow: Process EPUBs from UI

```
[User uploads EPUBs in browser]
    ↓
[React Component: FileDropzone]
    ↓
[useProcessEpubs mutation]
    ↓
[POST /api/process (FormData with files)]
    ↓
[Express: Multer middleware saves to /uploads/]
    ↓
[Express: Process route handler]
    ↓
[API Service: processEpubForApi()]
    ↓
[Shared Logic: processEpubsWithErrors()]
    ├─→ [EPUB Discovery]
    ├─→ [EPUB Parsing]
    ├─→ [Text Extraction]
    ├─→ [Tokenization]
    └─→ [Output Generation]
    ↓ (via callbacks)
[Express: SSE progress updates]
    ↓ (Server-Sent Events)
[React Component: Progress display updates in real-time]
    ↓
[onComplete: Results saved to /results/]
    ↓
[TanStack Query: Invalidates 'results' query]
    ↓
[React Component: Results page displays new data]
```

### Request Flow: Upload Existing Results

```
[User uploads results.json]
    ↓
[React Component: FileUpload]
    ↓
[POST /api/results/upload (FormData)]
    ↓
[Express: Save to /results/results.json]
    ↓
[TanStack Query: Invalidates 'results' query]
    ↓
[React Component: Visualizes data with charts]
```

### Request Flow: Browse Server File System

```
[User clicks "Browse Server Files"]
    ↓
[GET /api/files?dir=/path/to/epubs]
    ↓
[Express: File system scanner]
    ↓
[Return: { files: [{name, path, size}] }]
    ↓
[React Component: File browser displays list]
    ↓
[User selects files → triggers process flow]
```

## Integration Points

### New vs Modified Components

| Component | Status | Action Required |
|-----------|--------|-----------------|
| CLI Layer | **UNCHANGED** | No modifications needed |
| EPUB Processing | **REUSE** | Move to shared package |
| Tokenization Engine | **REUSE** | Move to shared package |
| Output Layer | **MODIFY** | Add JSON output for API responses |
| Error Handler | **MODIFY** | Add error classification for API errors |
| Parallel Processing | **REUSE** | Use for background jobs |
| API Layer | **NEW** | Build Express server with routes |
| Frontend | **NEW** | Build React app with Vite |
| SSE Implementation | **NEW** | Add real-time progress streaming |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **CLI ↔ Shared Logic** | Direct import | CLI imports shared packages |
| **API ↔ Shared Logic** | Direct import | API imports shared packages |
| **Frontend ↔ API** | HTTP (REST) + SSE | Fetch API for requests, EventSource for progress |
| **API ↔ File System** | Direct fs access | API reads/writes to uploads/ and results/ |
| **API ↔ Background Jobs** | In-memory or Bull queue | Worker threads for parallel processing |

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Hugging Face Models** | Existing tokenizer code | No changes needed - downloads via @huggingface/transformers |
| **File System (Server)** | Direct fs access | API reads EPUBs from server directories |
| **Browser File System** | File API | User uploads EPUBs from local machine via browser |

## Build Order

### Phase 1: Shared Business Logic Extraction (Foundation)
**Why first:** Need to decouple business logic from CLI before adding API

**Components to build:**
- Move `src/epub/`, `src/tokenizers/`, `src/file-discovery/`, `src/errors/`, `src/output/`, `src/parallel/` to shared location
- Update imports in CLI to use shared packages
- Add shared TypeScript types

**Dependencies:** Existing code only

**Deliverable:** CLI still works, but imports from shared package

---

### Phase 2: Express API Server (Backend Foundation)
**Why second:** Need API before frontend can interact with it

**Components to build:**
- Express server with basic routing
- Health check endpoint (`GET /health`)
- File upload endpoint (`POST /api/upload` with Multer)
- Process endpoint (`POST /api/process`)
- Results endpoint (`GET /api/results`)
- Static file serving for React build

**Dependencies:** Shared business logic

**Deliverable:** API server that can process EPUBs via HTTP requests

---

### Phase 3: Background Job Processing (Async Support)
**Why third:** EPUB processing takes time - need async execution before adding UI

**Components to build:**
- Background job queue (worker threads or Bull)
- Job status tracking (in-memory or Redis)
- SSE emitter for progress updates

**Dependencies:** API server

**Deliverable:** Long-running EPUB processing doesn't block API responses

---

### Phase 4: React Frontend Foundation (UI Skeleton)
**Why fourth:** Need basic UI before adding complex features

**Components to build:**
- Vite + React + TypeScript setup
- React Router for navigation
- shadcn/ui component installation
- Basic layout (Header, Main, Footer)
- TanStack Query setup

**Dependencies:** API server

**Deliverable:** Basic multi-page React app connected to API

---

### Phase 5: File Upload & Processing (Core Feature)
**Why fifth:** Main value - users can process EPUBs from UI

**Components to build:**
- File dropzone component
- Upload progress display
- Process form (tokenizer selection)
- SSE progress component (real-time updates)
- Results display

**Dependencies:** Frontend foundation, Background jobs

**Deliverable:** Users can upload EPUBs and see real-time processing

---

### Phase 6: Data Visualization (Differentiator)
**Why sixth:** Visual insights set this apart from CLI

**Components to build:**
- Recharts integration
- Bar chart (token counts across books)
- Scatter plot (word vs token counts)
- Chart tooltips and interactivity

**Dependencies:** Results data from Phase 5

**Deliverable:** Rich visualizations of token data

---

### Phase 7: Token Budget Calculator (Advanced Feature)
**Why seventh:** Adds unique value for cost planning

**Components to build:**
- Budget calculator form
- "Which books fit X tokens?" algorithm
- Equivalence display UI

**Dependencies:** Visualization data

**Deliverable:** Users can plan token budgets

---

### Phase 8: Server File Browser (Convenience Feature)
**Why eighth:** Quality-of-life improvement for server-based workflows

**Components to build:**
- Server file system API endpoints
- File browser component
- Directory navigation

**Dependencies:** File system access on server

**Deliverable:** Users can browse server EPUBs without uploading

---

### Phase 9: Polish & Optimization (Production Ready)
**Why last:** Cross-cutting improvements

**Components to build:**
- Error handling improvements
- Loading states
- Responsive design
- Performance optimization
- Testing

**Dependencies:** All features

**Deliverable:** Production-ready Web UI

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **1-10 concurrent users** | Single Express server, in-memory job queue, worker threads |
| **10-100 concurrent users** | Add Redis for job queue, horizontal scaling with PM2 cluster |
| **100+ concurrent users** | Separate job workers, load balancer, CDN for static assets |

### Scaling Priorities

1. **First bottleneck:** EPUB processing CPU usage
   - **Fix:** Worker threads for parallel processing, limit concurrent jobs

2. **Second bottleneck:** Memory (Hugging Face models)
   - **Fix:** Lazy model loading, unload unused models, add --max-mb limit

3. **Third bottleneck:** File upload size
   - **Fix:** Stream uploads to disk, don't buffer in memory

## Anti-Patterns

### Anti-Pattern 1: Duplication Instead of Sharing

**What people do:** Copy-paste business logic into API layer instead of extracting shared package

**Why it's wrong:** Code duplication, bugs must be fixed twice, diverges over time

**Do this instead:** Extract shared logic into `packages/shared/` that both CLI and API import

---

### Anti-Pattern 2: Blocking API Responses

**What people do:** Process EPUBs synchronously in API route handler, blocking response

**Why it's wrong:** Browser times out, poor UX, server unresponsive

**Do this instead:** Use background jobs with SSE for real-time progress updates

---

### Anti-Pattern 3: Client-Side EPUB Processing

**What people do:** Send EPUB files to browser and process in JavaScript

**Why it's wrong:** Large files crash browser, can't use Hugging Face models easily, security risk

**Do this instead:** Always process on server, browser only displays results

---

### Anti-Pattern 4: Polling Instead of SSE

**What people do:** Poll `GET /api/job-status` every second for progress

**Why it's wrong:** Unnecessary HTTP overhead, delayed updates, server load

**Do this instead:** Use Server-Sent Events for real-time streaming

---

### Anti-Pattern 5: Monolithic Frontend Bundle

**What people do:** Import all chart libraries and UI components in main bundle

**Why it's wrong:** Slow initial load, large bundle size

**Do this instead:** Code splitting, lazy load chart libraries, dynamic imports

---

### Anti-Pattern 6: Tight Coupling to CLI Progress Format

**What people do:** Send cli-progress output directly to frontend via SSE

**Why it's wrong:** Frontend tied to CLI format, can't change UI independently

**Do this instead:** Create generic progress events that UI consumes

---

### Anti-Pattern 7: Ignoring Error Classification

**What people do:** Treat all errors the same in API responses

**Why it's wrong:** Users can't distinguish between retryable and fatal errors

**Do this instead:** Use existing error classification (FATAL/ERROR/WARN) in API responses

## Technology Stack Details

### Frontend Stack

| Technology | Purpose | Why |
|------------|---------|-----|
| **React 19** | UI framework | Latest React, excellent ecosystem |
| **Vite** | Build tool | Fast HMR, optimized builds, TypeScript-first |
| **TypeScript** | Type safety | Catch errors at compile time, better DX |
| **shadcn/ui** | Component library | Copy-paste components, full control, built on Radix UI |
| **React Router** | Routing | Standard for React, supports data loading |
| **TanStack Query** | Server state | Automatic caching, refetching, mutations |
| **Zustand** | Client state | Lightweight, simple alternative to Redux |
| **Recharts** | Data visualization | Recommended by shadcn, composable, SSR-friendly |

### Backend Stack

| Technology | Purpose | Why |
|------------|---------|-----|
| **Express.js** | API server | Simple, flexible, huge ecosystem |
| **TypeScript** | Type safety | Consistent with frontend, shared types |
| **Multer** | File uploads | Standard Express middleware for multipart |
| **SSE (native)** | Real-time progress | Built-in to Node.js/Express, simpler than WebSockets |
| **Worker Threads** | Parallel processing | Built-in Node.js, no external queue needed for small scale |

### Monorepo Tooling (Optional)

| Technology | Purpose | Why |
|------------|---------|-----|
| **Turborepo** | Monorepo management | Fast builds, simple config, good for small-to-medium repos |
| **Nx** | Alternative monorepo | More features, but steeper learning curve |

## Sources

### Web UI + CLI Integration
- [A Simple Monorepo Setup with Next.js and Express.js](https://medium.com/@serdar.ulutas/a-simple-monorepo-setup-with-next-js-and-express-js-4bbe0e99b259) - MEDIUM confidence (monorepo pattern)
- [How to deploy both a Next.js app and an Express.js API from a monorepo](https://stackoverflow.com/questions/77897056/how-to-deploy-both-a-next-js-app-and-an-express-js-api-from-a-monorepo) - MEDIUM confidence (deployment strategy)
- [Streamlining Full-Stack TypeScript Development with Monorepos](https://leapcell.io/blog/streamlining-full-stack-typescript-development-with-monorepos) - MEDIUM confidence (TypeScript monorepo best practices)
- [React Stack Patterns 2026](https://www.patterns.dev/react/react-2026/) - MEDIUM confidence (modern React patterns)

### Real-Time Communication
- [Real-Time Updates with Server-Sent Events (SSE) in Node.js and React](https://basirblog.hashnode.dev/welcome-to-the-magic-real-time-updates-with-server-sent-events-sse-in-nodejs-reactjs) - HIGH confidence (SSE implementation)
- [Real-time Log Streaming with Node.js and React using SSE](https://dev.to/manojspace/real-time-log-streaming-with-nodejs-and-react-using-server-sent-events-sse-48pk) - HIGH confidence (SSE practical example)
- [Understanding Server-Sent Events (SSE) with Node.js](https://itsfuad.medium.com/understanding-server-sent-events-sse-with-node-js-3e881c533081) - HIGH confidence (SSE basics)
- [Server-Sent Events - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) - HIGH confidence (official SSE documentation)

### File Upload
- [Handling File Uploads in Node.js with TypeScript](https://medium.com/@mohantaankit2002/handling-file-uploads-in-node.js-with-typescript-from-basic-to-advanced-25707eccb77b) - HIGH confidence (Multer + TypeScript)
- [expressjs/multer - GitHub](https://github.com/expressjs/multer) - HIGH confidence (official Multer docs)
- [File Upload API with Multer](https://dev.to/jakaria/file-upload-api-with-multer-12hc) - MEDIUM confidence (Multer implementation)

### State Management
- [React Server Components + TanStack Query: The 2026 Data Fetching Power Duo](https://dev.to/krish_kakadiya_5f0eaf6342/react-server-components-tanstack-query-the-2026-data-fetching-power-duo-you-cant-ignore-21fj) - HIGH confidence (2026 TanStack Query patterns)
- [TanStack Query Official Documentation](https://tanstack.com/query/v3/) - HIGH confidence (official docs)
- [React Query vs TanStack Query vs SWR: A 2025 Comparison](https://refine.dev/blog/react-query-vs-tanstack-query-vs-swr-2025/) - MEDIUM confidence (library comparison)

### Data Visualization
- [Beautiful Charts & Graphs - shadcn/ui](https://ui.shadcn.com/charts/area) - HIGH confidence (shadcn charts)
- [Chart Component - Shadcn UI Documentation](https://ui.shadcn.com/docs/components/chart) - HIGH confidence (shadcn chart API)
- [Recharts Official Documentation](https://recharts.org/) - HIGH confidence (Recharts library)

### Confidence Notes
- **HIGH confidence:** SSE implementation, Multer usage, TanStack Query patterns, shadcn/ui charts, official documentation
- **MEDIUM confidence:** Monorepo structure (Turborepo vs Nx), specific implementation patterns, library choices
- **LOW confidence:** None - all recommendations backed by sources or current best practices

---
*Architecture research for: EPUB Tokenizer Counter Web UI Integration*
*Researched: 2026-01-22*
