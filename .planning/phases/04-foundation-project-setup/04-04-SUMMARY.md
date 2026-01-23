---
phase: 04-foundation-project-setup
plan: 04
subsystem: shared-package
tags: monorepo, workspaces, typescript, dual-build, code-reuse

# Dependency graph
requires: [04-01, 04-02, 04-03]
provides:
  - @epub-counter/shared package with dual CJS/ESM builds
  - Shared TypeScript types (EpubMetadata, TokenizerResult, etc.)
  - npm workspace configuration linking shared, web, server
  - TypeScript path mapping for @epub-counter/shared imports
  - Unified build pipeline for all packages
affects: [05-web-ui-development, 06-backend-api-integration, 07-real-time-progress]

# Tech tracking
tech-stack:
  added: []
  patterns: [npm workspaces, dual CJS/ESM builds, TypeScript path mapping, workspace dependencies]

key-files:
  created: [packages/shared/package.json, packages/shared/tsconfig.json, packages/shared/tsconfig.cjs.json, packages/shared/tsconfig.esm.json, packages/shared/src/types.ts, packages/shared/src/index.ts]
  modified: [package.json, tsconfig.json, web/package.json, web/vite.config.ts, web/tsconfig.app.json, server/package.json, server/tsconfig.json, web/src/App.tsx, server/src/server.ts]

key-decisions:
  - "Dual CJS/ESM builds for shared package (Node.js and bundler compatibility)"
  - "npm workspaces for monorepo structure (simpler than Turborepo for localhost app)"
  - "TypeScript path mapping + npm workspace dependency pattern for shared imports"
  - "postinstall hook to build shared package automatically after npm install"
  - "Unified 'npm run build' compiles all packages (shared, web, server, CLI)"

patterns-established:
  - "Pattern: npm workspace dependencies with '*' version (workspace protocol)"
  - "Pattern: Dual-build TypeScript configs (tsconfig.cjs.json, tsconfig.esm.json)"
  - "Pattern: Package exports field for conditional CJS/ESM resolution"
  - "Pattern: Path mapping in tsconfig + Vite alias for seamless imports"

# Metrics
duration: 30min
completed: 2026-01-23
---

# Phase 4: Plan 4 - Shared TypeScript Package Summary

**Dual CJS/ESM shared package with npm workspaces, unified build pipeline, and type-safe imports across frontend, backend, and CLI**

## Performance

- **Duration:** 30 min
- **Started:** 2026-01-23T13:34:28Z
- **Completed:** 2026-01-23T14:06:00Z
- **Tasks:** 6
- **Files modified:** 15
- **Commits:** 6

## Accomplishments

- Created @epub-counter/shared package with dual CJS/ESM build configuration
- Defined shared TypeScript types (EpubMetadata, Tokenizer, TokenizerResult, ProcessOptions, etc.)
- Configured npm workspaces linking shared, web, and server packages
- Added TypeScript path mapping for @epub-counter/shared imports across all packages
- Verified both frontend and backend can import and use shared types
- Unified build pipeline: `npm run build` compiles shared, web, server, and CLI
- Added postinstall hook to automatically build shared package after npm install

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared package directory structure and configuration** - `d0483d3` (feat)
2. **Task 2: Create shared types and main entry point** - `9c1c4db` (feat)
3. **Task 3: Configure npm workspaces and build scripts** - `9cdfeb6` (feat)
4. **Task 4: Build shared package and verify dual outputs** - `6b7a4b7` (feat)
5. **Task 5: Test shared package imports from frontend and backend** - `83d84c8` (feat)
6. **Task 6: Verify npm run build compiles both frontend and backend** - `0e66bfb` (feat)

**Plan metadata:** (to be committed after SUMMARY.md creation)

## Files Created/Modified

### Created:
- `packages/shared/package.json` - Shared package config with dual CJS/ESM exports
- `packages/shared/tsconfig.json` - Base TypeScript config extending root
- `packages/shared/tsconfig.esm.json` - ESM build config for Vite/bundlers
- `packages/shared/tsconfig.cjs.json` - CJS build config for Node.js
- `packages/shared/src/types.ts` - Shared TypeScript interfaces and types
- `packages/shared/src/index.ts` - Main entry point barrel export
- `packages/shared/dist/cjs/` - CJS build output (verified uses `require`/`module.exports`)
- `packages/shared/dist/esm/` - ESM build output (verified uses `export` statements)

### Modified:
- `package.json` - Added build:shared, build:web, build:server scripts, postinstall hook
- `tsconfig.json` - Added paths mapping for @epub-counter/shared
- `web/package.json` - Added @epub-counter/shared dependency
- `web/vite.config.ts` - Added @epub-counter/shared alias
- `web/tsconfig.app.json` - Added @epub-counter/shared path mapping
- `server/package.json` - Added @epub-counter/shared dependency
- `server/tsconfig.json` - Standalone config (no longer extends root to avoid rootDir conflicts)
- `web/src/App.tsx` - Test imports from @epub-counter/shared
- `server/src/server.ts` - Uses HealthResponse type from @epub-counter/shared

## Decisions Made

**Configuration choices:**
- Dual CJS/ESM builds using separate tsconfig files (tsconfig.cjs.json, tsconfig.esm.json)
- Package exports field with conditional import/require resolution for Node.js and bundlers
- npm workspaces with '*' version for workspace dependencies (simpler than Yarn workspaces)
- TypeScript path mapping combined with Vite alias for seamless import resolution
- postinstall hook instead of preinstall to avoid build-before-dependencies issues
- Server uses standalone tsconfig to avoid rootDir inheritance conflicts from root

**Rationale:**
- Dual builds ensure shared package works in both Node.js (CLI/server) and Vite (frontend) environments
- npm workspaces provide simplicity for localhost-only app (Turborepo would be overkill)
- TypeScript path mapping + workspace dependency pattern allows type-safe imports without bundler tricks
- postinstall hook ensures shared package is always built after npm install, catching dependency updates

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed package.json trailing comma**
- **Found during:** Task 3 - npm install failed with JSON parse error
- **Issue:** Trailing comma after scripts object in root package.json
- **Fix:** Removed trailing comma to make valid JSON
- **Files modified:** package.json

**2. [Rule 3 - Blocking] Fixed tsconfig rootDir conflicts**
- **Found during:** Task 5 - Server TypeScript compilation failed
- **Issue:** Server tsconfig extended root which had rootDir: "./src", causing conflicts
- **Fix:** Server uses standalone tsconfig.json without extending root
- **Files modified:** server/tsconfig.json
- **Commit:** 83d84c8

**3. [Rule 1 - Bug] Fixed unused variable TypeScript errors**
- **Found during:** Task 6 - Web build failed with noUnusedLocals errors
- **Issue:** testMetadata and testTokenizer declared but never used
- **Fix:** Prefixed with underscore (_testMetadata, _testTokenizer) and added console.log
- **Files modified:** web/src/App.tsx
- **Commit:** 0e66bfb

## Authentication Gates

None - no external services requiring authentication in this plan.

## Issues Encountered

**Issue 1: TypeScript project references approach failed**
- Initial attempt used composite project references and tsconfig references
- Failed because dual-build outputs (dist/cjs, dist/esm) didn't match reference expectations
- **Solution:** Switched to npm workspace dependencies + path mapping approach (simpler, works better)

**Issue 2: Server tsconfig rootDir inheritance**
- Server tsconfig extending root caused rootDir conflicts
- **Solution:** Server uses standalone tsconfig without extending root

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next phase:**
- Shared package builds successfully to both CJS and ESM formats
- Frontend and backend can both import and use shared types without errors
- Unified build pipeline (`npm run build`) compiles all packages
- npm workspaces properly configured and linked

**Delivered artifacts (from must_haves):**
- [x] Shared package builds successfully to both CJS and ESM formats
- [x] Frontend can import types from @epub-counter/shared without errors
- [x] Backend can import types from @epub-counter/shared without errors
- [x] npm run build compiles shared package to dist/cjs and dist/esm
- [x] npm run build compiles frontend (web) and backend (server)

**Next steps:**
- Phase 5 will begin Web UI development using shared types
- Phase 6 will integrate shared types into backend API endpoints
- Phase 7 will use shared types for real-time progress messages

**Key files for future phases:**
- `packages/shared/src/types.ts` - Import these types in API responses and UI components
- `npm run build` - Use this command to build all packages before deployment
- `@epub-counter/shared` dependency - Already added to web/ and server/ package.json

---
*Phase: 04-foundation-project-setup*
*Plan: 04*
*Completed: 2026-01-23*
*Wave: 2 of 2*
