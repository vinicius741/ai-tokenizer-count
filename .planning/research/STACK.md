# Technology Stack: Web UI Additions

**Project:** EPUB Tokenizer Counter - Web UI Milestone
**Researched:** 2026-01-22
**Mode:** Ecosystem (Stack Additions for v2.0)

## Overview

This document specifies technology additions for adding a React + shadcn/ui Web UI to the existing Node.js TypeScript CLI tool. The existing CLI codebase (tokenizers, EPUB processing, output generation) will be reused as-is in the backend server.

**Key Design Decision:** Separate frontend/backend architecture with the frontend built as a React SPA and the backend as a Node.js server that reuses existing CLI modules.

## Recommended Stack Additions

### Frontend Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React** | 19.2+ | UI framework | Latest stable with improved hooks, automatic batching, and better TypeScript support |
| **Vite** | 7.3+ | Build tool & dev server | Fast HMR, optimized builds, native ESM support, official React template available |
| **TypeScript** | 5.6+ | Type safety | Already in use, consistent with existing codebase |
| **shadcn/ui** | Latest (via CLI) | Component library | Copy-paste components (not npm package), full customization, built on Radix UI + Tailwind |

**Why React + Vite:**
- Vite provides instant server start and lightning-fast HMR (vs webpack's slow builds)
- Official React TypeScript template: `npm create vite@latest frontend -- --template react-ts`
- React 19 is the current stable version with better performance and developer experience
- shadcn/ui is NOT an npm package - you copy components into your codebase for full control

### UI Component System

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tailwind CSS** | 4.0+ | Utility-first CSS | Required by shadcn/ui, rapid UI development, consistent design system |
| **Radix UI** | Latest | Unstyled accessible primitives | Foundation for shadcn/ui components, ARIA compliant, keyboard navigation |
| **class-variance-authority** | Latest | Component variant system | Used by shadcn/ui for styled variants |
| **clsx** | Latest | Conditional className utility | Used by shadcn/ui for conditional classes |
| **tailwind-merge** | Latest | Merge Tailwind classes | Prevents class conflicts in shadcn/ui components |

**Why shadcn/ui:**
- Components are copied to your project (not installed as dependency)
- Full customization - you own the code
- Built on Radix UI (accessibility) + Tailwind (styling)
- Active community, regular updates
- Perfect fit for this project - need basic UI components (buttons, cards, forms, tables)

### Data Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Recharts** | 3.7+ | Charting library | React-native, built on D3, composable components, declarative API |
| **D3.js** | 7+ (transitive) | Underlying visualization engine | Used by Recharts for low-level operations |

**Why Recharts over alternatives:**
- **React-first:** Components are React components, not imperative APIs
- **Declarative:** `<BarChart data={data}>` vs imperative Chart.js setup
- **TypeScript:** Built-in TypeScript support
- **Composable:** Mix and match chart types easily
- **Lightweight:** Smaller bundle than full D3, more flexible than Chart.js
- **Active maintenance:** Version 3.7+ released in 2025

Alternatives considered:
- **Chart.js:** Imperative API, less React-friendly
- **Victory:** Less active development
- **Nivo:** Good but more complex setup
- **Plotly:** Overkill for simple bar/scatter plots

### Backend Server

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Fastify** | 5.7+ | Web framework | 2-3x faster than Express, JSON schema validation, TypeScript-first, plugin ecosystem |
| **@fastify/cors** | 9.4+ | CORS middleware | Official plugin, enables frontend-backend communication on localhost |
| **@fastify/multipart** | 11.2+ | File upload support | Handle EPUB file uploads and results.json uploads from drag-drop UI |
| **@fastify/static** | Latest | Serve static files | Optional: serve React build from server (or use separate dev server) |

**Why Fastify over Express:**
- **Performance:** 2-3x faster JSON handling (important for large token count results)
- **TypeScript:** First-class TypeScript support with auto-generated types
- **Schema validation:** Built-in JSON Schema validation for request/response
- **Modern:** Active development in 2025, Express is described as "basically on life support"
- **Ecosystem:** 300+ plugins available

Integration with existing code:
- Existing CLI modules (`src/tokenizers/`, `src/epub/`, `src/output/`) will be imported as-is
- No changes needed to core tokenization logic
- Server wraps existing functions in HTTP endpoints

### Frontend Build Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vite** | 7.3+ | Build & dev server | Already listed above - dual purpose for dev and build |
| **@vitejs/plugin-react** | Latest | React support in Vite | Official Vite plugin for React JSX transformation |
| **ESLint** | 9+ | Linting | Catch errors early, consistent code style |
| **@typescript-eslint** | Latest | TypeScript ESLint rules | TypeScript-aware linting |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **concurrently** | Run dev servers in parallel | Run frontend and backend dev servers with single command |
| **npm-run-all** | Alternative to concurrently | Script orchestration, if preferred over concurrently |
| **cross-env** | Cross-platform env variables | Set NODE_ENV across Windows/macOS/Linux |

## Installation

### Full Stack Setup

```bash
# Backend additions (in project root)
npm install fastify@^5.7.0
npm install @fastify/cors@^9.4.0
npm install @fastify/multipart@^11.2.0
npm install @fastify/static@^7.0.0

# Dev dependencies for backend
npm install -D concurrently@^9.0.0
npm install -D cross-env@^7.0.0

# Frontend (in new frontend/ directory)
cd frontend
npm create vite@latest . -- --template react-ts
npm install

# shadcn/ui setup (after Vite project created)
npx shadcn@latest init
# Follow prompts: TypeScript, Tailwind CSS, src/ directory

# Install shadcn/ui components needed
npx shadcn@latest add button card input label select table tabs
npx shadcn@latest add progress toast dropdown-menu dialog

# Data visualization
npm install recharts@^3.7.0

# Additional utilities
npm install clsx tailwind-merge class-variance-authority
```

### Development Scripts

Update `package.json` in project root:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/cli/index.js",
    "dev:server": "tsx watch src/server/index.ts",
    "dev:frontend": "cd frontend && npm run dev",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:frontend\"",
    "build:frontend": "cd frontend && npm run build",
    "build:all": "npm run build && npm run build:frontend"
  }
}
```

## Project Structure

```
epub-tokenizer-count/
├── src/                    # Existing CLI code (unchanged)
│   ├── cli/               # CLI entry point (still works)
│   ├── tokenizers/        # Tokenization logic (reused by server)
│   ├── epub/              # EPUB processing (reused by server)
│   ├── output/            # Output generation (reused by server)
│   └── server/            # NEW: Fastify server
│       ├── index.ts       # Server setup
│       ├── routes/        # API route handlers
│       └── middleware/    # Server middleware
│
├── frontend/              # NEW: React + Vite frontend
│   ├── src/
│   │   ├── components/   # shadcn/ui components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities, API client
│   │   ├── App.tsx       # React app root
│   │   └── main.tsx      # React entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── dist/                  # Compiled backend (CLI + server)
├── results/               # Server-side results storage
└── package.json           # Root package.json
```

## Integration Points

### Backend (Node.js Server)

**New server module:** `src/server/index.ts`

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { createTokenizers, tokenizeText } from '../tokenizers/index.js';
import { parseEpub } from '../epub/parser.js';

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: ['http://localhost:5173'], // Vite dev server
  credentials: true,
});

await server.register(multipart);

// Routes reuse existing CLI modules
server.post('/api/process', async (request, reply) => {
  // Use existing parseEpub, tokenizeText functions
  // Return JSON in same format as CLI output
});

server.post('/api/upload-results', async (request, reply) => {
  // Handle uploaded results.json
  // Return parsed data for visualization
});

await server.listen({ port: 3000 });
```

**Key integration points:**
- `src/tokenizers/index.ts` - `createTokenizers()`, `tokenizeText()` reused as-is
- `src/epub/parser.ts` - `parseEpub()` reused as-is
- `src/output/json.ts` - `generateJsonOutput()` reused as-is
- Existing error handling from `src/errors/handler.ts` reused

### Frontend (React + Vite)

**API client:** `frontend/src/lib/api.ts`

```typescript
const API_BASE = 'http://localhost:3000/api';

export async function processEpubs(
  files: File[],
  tokenizers: string[]
): Promise<ProcessingResult> {
  const formData = new FormData();
  files.forEach(file => formData.append('epubs', file));
  formData.append('tokenizers', JSON.stringify(tokenizers));

  const response = await fetch(`${API_BASE}/process`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

export async function uploadResults(file: File): Promise<ResultsData> {
  const formData = new FormData();
  formData.append('results', file);

  const response = await fetch(`${API_BASE}/upload-results`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}
```

**Visualization components:** `frontend/src/components/charts/`

```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function TokenBarChart({ data }: { data: EbookResult[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="title" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="token_count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **React + Vite** | Next.js | If you need SSR, routing, or API routes. Overkill for localhost-only UI. |
| **shadcn/ui** | MUI, Chakra UI | If you prefer pre-packaged component libraries over copy-paste. shadcn/ui gives more control. |
| **Recharts** | Chart.js, Nivo | If you need more chart types or complex visualizations. Recharts is simpler for basic bar/scatter plots. |
| **Fastify** | Express, Hono | Use Express for ecosystem compatibility. Use Hono for edge computing (Bun, Deno, Cloudflare). Fastify is best for Node.js servers. |
| **TypeScript** | JavaScript | Never. TypeScript prevents entire classes of bugs and improves DX. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Webpack** | Complex configuration, slow builds compared to Vite | Vite (simpler, faster) |
| **Create React App** | Deprecated, uses webpack, outdated patterns | Vite React template |
| **Chart.js** | Imperative API, less React-friendly | Recharts (React-native) |
| **Material-UI** | Heavy bundle size, less customization | shadcn/ui (lighter, full control) |
| **Express** | Slower, older, less TypeScript-friendly | Fastify (faster, modern) |
| **Authentication libraries** | Not needed for localhost-only access | None - no authentication required |
| **Database** | Server file system storage is sufficient | Local filesystem (`results/` directory) |
| **Docker** | Adds complexity for local development | Direct Node.js execution |

## Stack Patterns by Variant

**If deploying to production later:**
- Add **environment variables** for configuration (`PORT`, `CORS_ORIGIN`)
- Consider **Nginx reverse proxy** for frontend + backend on same port
- Add **Helmet.js** for security headers (via `@fastify/helmet`)
- Add **rate limiting** (via `@fastify/rate-limit`)

**If adding authentication later:**
- Add **JWT tokens** (`@fastify/jwt`)
- Add **session management** (`@fastify/session`)
- Consider **OAuth providers** for social login

**If performance issues arise:**
- Add **Redis caching** for repeated tokenizer requests
- Implement **streaming responses** for large result sets
- Add **compression** (`@fastify/compress`)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Vite 7.3+ | React 19.2+ | Official template tested |
| React 19.2+ | TypeScript 5.6+ | Full type support |
| shadcn/ui | Tailwind CSS 4.0+ | Requires Tailwind for styling |
| Fastify 5.7+ | Node.js 20.19+, 22.12+ | Minimum Node.js version |
| Recharts 3.7+ | React 18+ | React 19 fully supported |
| @fastify/multipart 11.2+ | Fastify 5.7+ | Latest major versions compatible |

**Important:** Ensure Node.js version is 20.19+ or 22.12+ for Fastify 5.7+ compatibility.

## Server-Side File Storage

**Storage approach:** Server filesystem (no database)

```
results/                  # Server-side storage directory
├── uploads/             # Uploaded EPUB files (temporary)
├── processed/           # Generated results.json files
└── cache/               # Cached tokenizer models (HF downloads)
```

**Why filesystem, not database:**
- Results are immutable JSON snapshots
- No complex queries needed (read by filename, list all)
- Simpler deployment (no database setup)
- Sufficient for localhost-only access
- Easy to backup and migrate

**Storage lifecycle:**
- Uploaded EPUBs: Deleted after processing
- Generated results: Stored indefinitely (user can delete via UI)
- Tokenizer cache: Persisted for performance

## Confidence Levels

### HIGH Confidence (Verified with official sources)

- **Vite 7.3+**: Verified on [vite.dev](https://vite.dev/guide/)
- **React 19.2+**: Latest stable version (verified via npm)
- **Fastify 5.7+**: Verified on [fastify.dev](https://fastify.dev)
- **@fastify/cors 9.4+**: Latest version (verified via npm)
- **@fastify/multipart 11.2+**: Latest version (verified via npm)
- **shadcn/ui**: Official site [ui.shadcn.com](https://ui.shadcn.com) confirms approach
- **TypeScript 5.6+**: Already in use, verified in package.json
- **Recharts 3.7+**: Latest version (verified via npm and recharts.org)

### MEDIUM Confidence (Verified with WebSearch + community consensus)

- **Fastify vs Express**: WebSearch confirms Fastify is 2-3x faster and more modern in 2025
- **Recharts vs Chart.js**: WebSearch confirms Recharts is more React-friendly
- **shadcn/ui benefits**: Community consensus on copy-paste approach for customization

### LOW Confidence (May need validation)

- **Tailwind CSS 4.0+**: Version assumed based on shadcn/ui requirements - verify during setup
- **Specific component list**: Exact shadcn/ui components needed may vary during implementation

## Roadmap Implications

### Phase Dependencies

**Phase 1: Backend Server Foundation**
- Add Fastify, @fastify/cors, @fastify/multipart
- Create basic server with health check endpoint
- Test CORS communication with local frontend

**Phase 2: Frontend Scaffold**
- Create Vite + React + TypeScript project
- Install and configure shadcn/ui
- Test HMR and build pipeline

**Phase 3: API Integration**
- Implement `/api/process` endpoint (reuse existing CLI modules)
- Implement `/api/upload-results` endpoint
- Create frontend API client
- Test file uploads (drag-drop EPUBs, results.json)

**Phase 4: Data Visualization**
- Install Recharts
- Create TokenBarChart component
- Create ScatterPlot component (word count vs token count)
- Implement chart data transformation utilities

**Phase 5: Token Budget Calculator**
- Create calculator UI component
- Implement "which books fit X tokens" algorithm
- Integrate with chart data

### Critical Path

**Fastify + existing CLI modules integration** is the critical path:
- Must verify existing `tokenizers/index.ts` works in server context
- Must verify `@huggingface/transformers` (async) works with Fastify
- Recommend creating spike test early: "Can we call `tokenizeText()` from Fastify route handler?"

**Potential blockers:**
- Hugging Face transformers.js async behavior in server context
- File upload handling for large EPUB files (>500MB)
- CORS issues between Vite dev server (5173) and Fastify (3000)

### Testing Strategy

- **Unit tests**: Existing CLI tests continue to work
- **Integration tests**: Add server route tests (using Fastify's `inject()` method)
- **E2E tests**: Optional - use Playwright for frontend UI tests
- **Manual tests**: Verify file uploads, chart rendering, calculator logic

## Sources

### Official Documentation (HIGH confidence)

- [Vite Getting Started](https://vite.dev/guide/) - Verified Vite 7.3.1
- [shadcn/ui Official Site](https://ui.shadcn.com) - Component library approach
- [Fastify Official Site](https://fastify.dev) - Framework features and performance
- [Recharts Official Site](https://recharts.org) - React charting library
- [Fastify Multipart GitHub](https://github.com/fastify/fastify-multipart) - File upload handling
- [@fastify/cors GitHub](https://github.com/fastify/fastify-cors) - CORS configuration

### WebSearch Verification (MEDIUM confidence)

- [Fastify vs Express vs Hono: 2025 Comparison](https://betterstack.com/community/guides/scaling-nodejs/fastify-vs-express-vs-hono/) - Framework comparison
- [React File Upload Guide 2025](https://magicui.design/blog/react-js-file-upload) - File upload patterns
- [Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) - Recharts recommendation
- [Vite React TypeScript Setup 2025](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2) - Build tooling

### Package Versions (HIGH confidence - verified via npm)

- `npm view vite version` - 7.3.1
- `npm view react version` - 19.2.3
- `npm view fastify version` - 5.7.1
- `npm view recharts version` - 3.7.0
- `npm view @fastify/cors version` - 9.4.0
- `npm view @fastify/multipart version` - 11.2.0
- `npm view @huggingface/transformers version` - 3.8.1 (existing dependency)

---
*Stack research for: EPUB Tokenizer Counter Web UI*
*Researched: 2026-01-22*
