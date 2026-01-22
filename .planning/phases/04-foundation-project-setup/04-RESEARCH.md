# Phase 04: Foundation & Project Setup - Research

**Researched:** 2026-01-22
**Domain:** Full-stack TypeScript (Vite + React + Fastify)
**Confidence:** HIGH

## Summary

This research covers the foundation setup for adding a Web UI to the existing EPUB Tokenizer Counter CLI tool. The phase requires setting up a React + Vite + shadcn/ui frontend, a Fastify backend API server, and a shared TypeScript package for code reuse between frontend, backend, and existing CLI.

**Key findings:**
- **Frontend:** Vite + React + TypeScript is the standard setup, with shadcn/ui providing accessible, customizable components via copy-paste (not npm install)
- **Backend:** Fastify (NOT Express as mentioned in older architecture docs) is the chosen framework for better performance and TypeScript support
- **Shared Package:** A single-repo approach with a packages/shared directory is recommended over full monorepo tooling for this project size
- **CORS:** @fastify/cors plugin is required for API communication between frontend (port 5173) and backend (port 8787)
- **Development:** Use `concurrently` to run both frontend and backend with a single `npm run dev` command

**Primary recommendation:** Use a single-repo structure with separate frontend, backend, and shared directories. Start with Vite's React TypeScript template, add shadcn/ui components incrementally, scaffold Fastify with TypeScript, and create a simple shared package using npm workspaces.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Vite** | 6.x | Frontend build tool & dev server | Fast HMR, optimized builds, industry standard for React apps |
| **React** | 19.x | UI library | Latest React with excellent ecosystem and TypeScript support |
| **TypeScript** | 5.6+ | Type safety | Consistent with existing CLI, catch errors at compile time |
| **Fastify** | 5.x | Backend API server | High performance, excellent TypeScript support, plugin ecosystem |
| **shadcn/ui** | latest | Component library | Copy-paste components, full control, built on Radix UI |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@fastify/cors** | latest | CORS middleware | Required for frontend-backend communication |
| **concurrently** | latest | Run multiple npm scripts | Start frontend and backend with single command |
| **Tailwind CSS** | 4.x | Styling (shadcn dependency) | Required by shadcn/ui for component styling |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **Fastify** | Express.js | Fastify has better performance and TypeScript support; Express has larger ecosystem |
| **Single-repo** | Turborepo/Nx | Monorepo tools add complexity for small teams; single-repo is simpler for this project size |
| **Vite** | Next.js | Next.js provides SSR but adds complexity; Vite is simpler for SPA |
| **shadcn/ui** | Chakra UI, MUI | shadcn gives full code control; others are traditional npm packages |

**Installation:**
```bash
# Frontend dependencies (in web/ directory)
npm create vite@latest web -- --template react-ts
npm install

# shadcn/ui (after Vite setup)
npx shadcn@latest init

# Backend dependencies (in api/ or server/ directory)
npm install fastify
npm install -D typescript @types/node

# Shared package (in packages/shared/ directory)
npm install -D typescript

# Dev tools (root)
npm install -D concurrently
```

## Architecture Patterns

### Recommended Project Structure

Based on research, a **single-repo structure** (not full monorepo) is recommended for this project:

```
epub-tokenizer-counter/
├── packages/
│   └── shared/              # Shared TypeScript code
│       ├── src/
│       │   ├── epub/        # From current src/epub/
│       │   ├── tokenizers/  # From current src/tokenizers/
│       │   ├── file-discovery/
│       │   ├── errors/
│       │   ├── output/
│       │   ├── parallel/
│       │   └── types.ts     # Shared types/interfaces
│       ├── package.json
│       └── tsconfig.json
│
├── web/                     # NEW: React frontend (Vite)
│   ├── src/
│   │   ├── pages/          # Route pages
│   │   ├── components/     # React components
│   │   ├── lib/            # API client, utilities
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                  # NEW: Fastify backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # CORS, etc.
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── src/                     # EXISTING: CLI code
│   ├── cli/
│   ├── epub/
│   ├── tokenizers/
│   └── ...
│
├── package.json             # Root with workspaces config
├── tsconfig.json            # Root TypeScript config
└── README.md
```

**Why this structure?**
- **Simplicity:** No monorepo tooling overhead (Turborepo, Nx) for a single-developer project
- **Clear separation:** Frontend, backend, shared code, and CLI are logically separated
- **Easy migration:** Can add Turborepo later if project grows
- **npm workspaces:** Simple workspace configuration in root package.json

### Pattern 1: npm Workspaces for Shared Package

**What:** Use npm's built-in workspaces feature to link the shared package

**When to use:** When you have multiple local packages that need to import each other

**Example:**
```json
// root package.json
{
  "name": "epub-tokenizer-counter",
  "private": true,
  "workspaces": [
    "packages/shared",
    "web",
    "server"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:server\"",
    "dev:web": "npm run dev --workspace=web",
    "dev:server": "npm run dev --workspace=server",
    "build": "npm run build --workspaces",
    "start": "node dist/cli/index.js"
  }
}
```

```json
// packages/shared/package.json
{
  "name": "@epub-counter/shared",
  "version": "1.0.0",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.esm.json && tsc -p tsconfig.cjs.json"
  }
}
```

```json
// tsconfig.cjs.json (CommonJS for Node/backend)
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/cjs",
    "module": "CommonJS",
    "moduleResolution": "node"
  }
}
```

```json
// tsconfig.esm.json (ESM for frontend/bundlers)
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/esm",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

**Usage:**
```typescript
// In frontend or backend
import { parseEpubFile } from '@epub-counter/shared';
```

**Key insight:** Shared package produces dual builds (CJS + ESM) to satisfy both Node.js and bundler environments.

### Pattern 2: Vite Dev Server with Proxy

**What:** Configure Vite to proxy API requests to backend during development

**When to use:** When frontend needs to call backend API during development (avoids CORS)

**Example:**
```typescript
// web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      }
    }
  }
});
```

```typescript
// web/src/lib/api.ts
export async function healthCheck() {
  const response = await fetch('/api/health');
  return response.json(); // { status: "ok" }
}
```

**Why:** Vite proxy only works in dev mode. In production, frontend and backend will be served separately (or backend serves frontend static files).

### Pattern 3: Fastify Server with CORS

**What:** Configure Fastify with @fastify/cors plugin for API communication

**When to use:** When backend needs to accept requests from different origins (frontend dev server)

**Example:**
```typescript
// server/src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true, // Allow all origins in development
  // In production, specify allowed origins:
  // origin: ['http://localhost:5173', 'https://yourdomain.com']
});

// Health check endpoint
fastify.get('/api/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 8787, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

### Pattern 4: shadcn/ui Installation and Theming

**What:** shadcn/ui is NOT a traditional npm package - it's a collection of components you copy into your project

**When to use:** When you need accessible, customizable UI components with Tailwind CSS

**Installation steps:**
```bash
# From web/ directory
npx shadcn@latest init
```

This will:
1. Install dependencies (Tailwind CSS, class-variance-authority, clsx, tailwind-merge)
2. Create components.json config
3. Configure Tailwind CSS
4. Create lib/utils.ts helper

**Adding components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# etc.
```

**Theming:**
shadcn/ui uses CSS variables for theming. Configure in `components.json`:

```json
{
  "style": "new-york",
  "tailwind": {
    "cssVariables": true,
    "baseColor": "zinc"  // or "neutral", "stone", "slate", "gray"
  }
}
```

**Recommended base color:** Zinc (neutral grays) - most flexible for data-focused applications

### Pattern 5: Concurrently for Dev Workflow

**What:** Run multiple npm scripts simultaneously with a single command

**When to use:** When you need to start frontend and backend servers together

**Example:**
```json
// root package.json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:server\"",
    "dev:ui": "concurrently \"npm run dev:web\" \"npm run dev:server\"",
    "dev:web": "cd web && npm run dev",
    "dev:server": "cd server && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

**Usage:**
```bash
npm run dev        # Starts both frontend (5173) and backend (8787)
npm run dev:ui     # Same command (alias)
```

### Anti-Patterns to Avoid

- **Monorepo overkill:** Don't use Turborepo/Nx for a single-developer project - npm workspaces is sufficient
- **Single shared build:** Don't try to produce one build for both frontend and backend - use dual CJS/ESM builds
- **Vite proxy in production:** Don't expect Vite proxy to work after build - it's dev-only
- **shadcn as npm package:** Don't `npm install shadcn-ui` - use the CLI to copy components
- **Express nostalgia:** Don't default to Express - Fastify has better performance and TypeScript support

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **CORS handling** | Custom CORS middleware | `@fastify/cors` plugin | Proper header handling, preflight requests, edge cases |
| **Dev server orchestration** | Custom scripts to start servers | `concurrently` | Handles process management, colored output, kill signals |
| **Component styling** | Custom CSS/Tailwind classes | shadcn/ui components | Accessibility tested, keyboard navigation, consistent patterns |
| **Hot module replacement** | Custom file watchers | Vite's built-in HMR | Instant updates, industry standard, battle-tested |
| **Module resolution** | Relative imports across packages | npm workspaces + package exports | Proper bundler integration, TypeScript support |
| **Build orchestration** | Custom build scripts | npm workspaces `--workspaces` flag | Builds in correct order, handles dependencies |

**Key insight:** Modern frontend tooling has solved many problems. Use existing solutions rather than building custom infrastructure.

## Common Pitfalls

### Pitfall 1: Single Build Output for Shared Package

**What goes wrong:** Trying to produce one JavaScript build that works for both frontend (Vite) and backend (Node.js)

**Why it happens:** Vite expects ESM, Node.js backend uses CommonJS (default)

**How to avoid:** Configure shared package to produce dual builds (CJS + ESM) with separate tsconfig files

**Warning signs:**
- "Unexpected token 'export'" errors in Node.js
- Frontend builds successfully but fails at runtime
- CommonJS cannot handle ESM syntax

**Fix:**
```json
// packages/shared/package.json
{
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  }
}
```

### Pitfall 2: CORS Errors in Development

**What goes wrong:** Frontend (localhost:5173) cannot call backend (localhost:8787) - browser blocks request

**Why it happens:** Same-origin policy blocks cross-origin requests without proper CORS headers

**How to avoid:** Install and configure `@fastify/cors` plugin in backend

**Warning signs:**
- Browser console shows "CORS policy blocked" error
- Network tab shows request with OPTIONS preflight failing
- Request never reaches backend handler

**Fix:**
```typescript
// server/src/server.ts
import cors from '@fastify/cors';
await fastify.register(cors, { origin: true });
```

### Pitfall 3: Vite Proxy Doesn't Work in Production

**What goes wrong:** API calls work in dev but fail after `npm run build`

**Why it happens:** `server.proxy` in vite.config.ts is dev-only, not included in production build

**How to avoid:** Understand that production setup is different - frontend and backend served separately

**Warning signs:**
- Dev works perfectly, production build fails
- API calls return 404 after deployment

**Fix options:**
1. Serve frontend static files from Fastify in production
2. Deploy frontend and backend separately (configure API URL in env var)
3. Use reverse proxy (nginx) in production

### Pitfall 4: shadcn/ui Components Not Styled

**What goes wrong:** After adding shadcn components, they appear unstyled or broken

**Why it happens:** Tailwind CSS not configured, CSS variables not defined, or base styles missing

**How to avoid:** Run `npx shadcn@latest init` before adding components

**Warning signs:**
- Components look like default HTML elements
- No colors, borders, or shadows
- Layout is broken

**Fix:**
```bash
npx shadcn@latest init
# This configures Tailwind, creates global.css with CSS variables
```

### Pitfall 5: Port Conflicts

**What goes wrong:** Frontend or backend fails to start because port is already in use

**Why it happens:** Default ports (5173, 8787) may be used by other services

**How to avoid:** Configure ports in both Vite and Fastify configs

**Warning signs:**
- "Address already in use" error
- EADDRINUSE error

**Fix:**
```typescript
// web/vite.config.ts
export default defineConfig({
  server: { port: 5173 }
});

// server/src/server.ts
await fastify.listen({ port: 8787 });
```

### Pitfall 6: TypeScript Module Resolution Errors

**What goes wrong:** Cannot import from shared package - "Module not found" or type errors

**Why it happens:** npm workspaces not linked, tsconfig not configured, or package.json exports missing

**How to avoid:** Run `npm install` from root after adding workspaces, configure tsconfig paths

**Warning signs:**
- Red squiggly lines on imports from @epub-counter/shared
- "Cannot find module" errors
- IntelliSense doesn't work

**Fix:**
```json
// root tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@epub-counter/shared": ["./packages/shared/src"]
    }
  }
}
```

## Code Examples

### Vite + React + TypeScript Setup

```bash
# Create new Vite project
npm create vite@latest web -- --template react-ts

# Navigate and install
cd web
npm install

# Start dev server
npm run dev
# Opens http://localhost:5173
```

### Fastify Server with TypeScript

```typescript
// server/src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true,
});

// CORS configuration
await fastify.register(cors, {
  origin: true,
});

// Health check
fastify.get('/api/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 8787, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

```json
// server/package.json
{
  "name": "server",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "fastify": "^5.7.0",
    "@fastify/cors": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0",
    "tsx": "^4.19.0"
  }
}
```

### shadcn/ui Installation

```bash
# Initialize shadcn/ui
cd web
npx shadcn@latest init

# Interactive prompts:
# - Style: new-york
# - Base color: zinc
# - CSS variables: yes

# Add components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

```typescript
// web/src/App.tsx
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

function App() {
  return (
    <div className="p-4">
      <Card className="p-4">
        <h1 className="text-2xl font-bold">EPUB Tokenizer Counter</h1>
        <Button>Process EPUBs</Button>
      </Card>
    </div>
  );
}

export default App;
```

### Root Package Configuration

```json
// package.json (root)
{
  "name": "epub-tokenizer-counter",
  "version": "2.0.0",
  "private": true,
  "workspaces": [
    "packages/shared",
    "web",
    "server"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:server\"",
    "dev:ui": "concurrently \"npm run dev:web\" \"npm run dev:server\"",
    "dev:web": "npm run dev --workspace=web",
    "dev:server": "npm run dev --workspace=server",
    "build": "npm run build --workspaces --if-present",
    "start": "node dist/cli/index.js",
    "postinstall": "npm run build --workspace=packages/shared"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

### Shared Package Structure

```typescript
// packages/shared/src/types.ts
export interface EpubMetadata {
  title: string;
  author: string;
  language?: string;
}

export interface TokenCountResult {
  filename: string;
  wordCount: number;
  tokens: Record<string, number>;
}

export interface ProcessOptions {
  tokenizers: string[];
  maxMb: number;
  outputDir: string;
}
```

```typescript
// packages/shared/src/epub/parser.ts
export async function parseEpubFile(filePath: string): Promise<any> {
  // Existing EPUB parsing logic
  // ...
}

export { extractText } from './text';
export { getMetadata } from './metadata';
```

```typescript
// packages/shared/src/index.ts
export * from './types';
export * from './epub/parser';
export * from './tokenizers';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| **Create React App** | **Vite** | 2022-2023 | CRA deprecated, Vite is now standard for new React apps |
| **Express.js** | **Fastify** | 2023+ | Fastify has 2x performance, better TypeScript support |
| **Traditional npm packages** | **Copy-paste components** | 2023+ | shadcn/ui popularized code ownership over package dependencies |
| **Full monorepo (Turborepo)** | **npm workspaces** | 2024+ | For small projects, workspaces are simpler than Turborepo |
| **Dual package systems** | **package.json "exports"** | 2022+ | New standard for conditional exports (CJS/ESM) |

**Deprecated/outdated:**
- **Create React App:** Officially deprecated, use Vite instead
- **Express.js default:** Still fine, but Fastify is preferred for new projects
- **Webpack configuration:** Vite handles this internally, no custom config needed
- **Monorepo for small projects:** npm/yarn workspaces are sufficient for < 5 packages

## Open Questions

1. **Production deployment strategy**
   - **What we know:** Vite proxy doesn't work in production
   - **What's unclear:** Should Fastify serve frontend static files, or deploy separately?
   - **Recommendation:** Start with separate deployment, consolidate later if needed

2. **Shared package build timing**
   - **What we know:** Shared package must build before frontend/backend can import it
   - **What's unclear:** Should we use `postinstall` or explicit build order?
   - **Recommendation:** Use `postinstall` script to build shared package automatically

3. **CLI to shared migration**
   - **What we know:** Existing CLI code needs to move to shared package
   - **What's unclear:** Should we migrate all at once or incrementally?
   - **Recommendation:** Incremental migration - move epub/ module first, verify, then move others

## Sources

### Primary (HIGH confidence)
- [Vite Official Documentation](https://vite.dev/guide/) - Getting started, CLI, project structure
- [Fastify TypeScript Documentation](https://fastify.io/docs/latest/Reference/TypeScript/) - Type system, generics, examples
- [Fastify Getting Started](https://fastify.io/docs/latest/Guides/Getting-Started/) - Installation, first server, plugins
- [shadcn/ui Installation Guide](https://ui.shadcn.com/docs/installation) - Framework-specific setup instructions
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) - CSS variables, color schemes

### Secondary (MEDIUM confidence)
- [How to sharing TypeScript codes Across Frontend and Backend in a Monorepo](https://dev.to/aoda-zhang/making-a-typescript-shared-package-work-across-frontend-and-backend-in-a-monorepo-1k23) - Dual-build strategy for shared packages (December 2025)
- [Vite, TypeScript, ESLint, Prettier and pre-commit hooks](https://dev.to/denivladislav/set-up-a-new-react-project-vite-typescript-eslint-prettier-and-pre-commit-hooks-3abn) - Complete Vite setup guide (May 2025)
- [Running React and Express with concurrently](https://blog.logrocket.com/running-react-express-concurrently/) - Dev server orchestration (August 2023)
- [React Folder Structure with Vite & TypeScript](https://medium.com/@prajwalabraham.21/react-folder-structure-with-vite-typescript-beginner-to-advanced-9cd12d1d18a6) - Project structure patterns
- [Understanding CORS and Setting it up with NestJS + Fastify](https://dev.to/tejastn10/understanding-cors-and-setting-it-up-with-nestjs-fastify-2lcp) - Fastify CORS setup (January 2025)

### Tertiary (LOW confidence)
- [Single repo frontend backend shared types](https://www.reddit.com/r/node/comments/1j139n4/how_to_share_types_between_typescript_react/) - Community discussion (January 2025)
- [How to share TS types between frontend and backend](https://stackoverflow.com/questions/79864656/how-to-share-ts-types-between-frontend-and-backend-when-both-lives-on-different) - StackOverflow discussion

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - Vite, React, Fastify, shadcn/ui are industry standards with official documentation
- Architecture: **HIGH** - npm workspaces, dual-build shared packages, and single-repo patterns are well-established
- Pitfalls: **HIGH** - CORS, module resolution, and build issues are well-documented with clear solutions

**Research date:** 2026-01-22
**Valid until:** 2026-07-01 (7 months for stable libraries/frameworks)
