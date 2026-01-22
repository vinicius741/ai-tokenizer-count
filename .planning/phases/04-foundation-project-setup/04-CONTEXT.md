# Phase 4: Foundation & Project Setup - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

## Phase Boundary

Establish the technical foundation for v2.0 Web UI: React + Vite + shadcn/ui frontend, Fastify backend, and shared TypeScript types layer. This phase creates the project structure, build configuration, and development workflow that all subsequent phases will build upon. No user-facing features are delivered in this phase — only infrastructure.

## Implementation Decisions

### Port Configuration
- Frontend dev server: **5173** (Vite default)
- Backend API server: **8787** (avoiding port 3000 which user uses for other projects)
- User specified: "I don't want any of them to use the 3000"

### Entry Points & Commands
- **npm run dev** — Single command that starts both frontend and backend concurrently
- **npm run dev:ui** — Alias for same (user wanted UI command to start both)
- **npm start** — CLI entry point (existing behavior preserved)

### Development Workflow
- Single dev command runs Vite frontend and Fastify backend concurrently
- User wanted "UI command starts both" for simpler development experience

### Shared Types Structure
- Use **packages/shared** with types/ folder that exports all interfaces
- Both frontend and backend import shared types from this package
- Decision: "Shared package" (not single types file)

### Dark Mode Support
- Support both light and dark modes
- Detect system preference automatically
- Use shadcn/ui built-in theming system

### Component Customization
- Customize shadcn/ui components as needed for our specific use case (tokens, EPUBs, data visualization)
- Don't keep components generic to default shadcn/ui — tailor them to our domain

### Claude's Discretion

**Project Structure:**
- How to organize frontend/backend code (separate directories vs monorepo)
- How existing CLI code relates to new backend (CLI at root vs in shared/)
- What goes in shared package (types only vs types + business logic)

**TypeScript Configuration:**
- tsconfig strategy (root base vs separate configs)
- Module resolution (path aliases vs relative imports)
- Module system (ESM vs CJS for each)

**Build & Dev Workflow:**
- Frontend-backend communication (Vite proxy vs direct calls)
- Build output locations (separate dist/ vs nested)

**shadcn/ui Setup:**
- Theme selection (Zinc, Slate, Violet, etc.)
- Component installation approach (add as needed vs pre-add common)

**Rationale:** User deferred these decisions to Claude ("you decide") — these are technical choices where standard best practices should guide implementation. Research phase should investigate optimal patterns.

## Specific Ideas

- Keep port 3000 free — user has other projects on that port
- Single `npm run dev` command should spin up both servers
- Dark mode should "just work" based on system preference

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 04-foundation-project-setup*
*Context gathered: 2026-01-22*
