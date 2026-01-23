---
phase: 05-backend-api-file-processing
plan: 01
subsystem: backend-api
tags: fastify, rest-api, tokenizers, typescript

# Dependency graph
requires: [04-04]
provides:
  - GET /api/list-models endpoint returning all available tokenizers
  - TokenizerInfo[] JSON response with gpt4, claude, and HF models
  - Route handler pattern for Fastify plugin registration
affects: [05-02, 05-03]

# Tech tracking
tech-stack:
  added: [fastify-plugin]
  patterns: [fastify plugin registration, API response wrapper, inline data duplication]

key-files:
  created: [server/src/routes/list-models.ts]
  modified: [server/src/server.ts]

key-decisions:
  - "Inline HF models list in server to avoid cross-package TypeScript rootDir issues"
  - "Use fastify-plugin fp default import, not named 'fp' export"
  - "API returns { success: true, data: TokenizerInfo[] } wrapper pattern"

patterns-established:
  - "Pattern: Fastify plugin with fp() for route registration"
  - "Pattern: API response wrapper with success + data fields"
  - "Pattern: Inline data duplication when cross-package imports cause build issues"

# Metrics
duration: 20min
completed: 2026-01-23
---

# Phase 5: Plan 1 - List Models API Endpoint Summary

**GET /api/list-models endpoint returning GPT-4, Claude, and 16 Hugging Face tokenizer models**

## Performance

- **Duration:** 20 min
- **Started:** 2026-01-23T17:37:45Z
- **Completed:** 2026-01-23T17:57:00Z
- **Tasks:** 3
- **Files created:** 1
- **Files modified:** 1
- **Commits:** 4

## Accomplishments

- Created GET /api/list-models endpoint in server/src/routes/list-models.ts
- Returns TokenizerInfo[] JSON array with 18 tokenizers (gpt4, claude, 16 HF models)
- Registered list-models route in server.ts using fastify.register()
- Verified endpoint returns correct data structure with required fields (id, name, description, async)
- All HF models have 'hf:' prefix and async: true flag

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify TokenizerInfo type exists in shared package** - Already complete (type existed in packages/shared/src/types.ts)
2. **Task 2: Create /api/list-models endpoint** - `ca49863` (feat)
3. **Task 3: Register list-models route in server** - `d9cef6f` (feat)
4. **Build fixes for fastify-plugin import and HF models list** - `8378412` (fix)

## Files Created/Modified

### Created:
- `server/src/routes/list-models.ts` - GET /api/list-models endpoint with inline HF models list

### Modified:
- `server/src/server.ts` - Added import and registration of listModelsHandler plugin

## Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "gpt4",
      "name": "GPT-4",
      "description": "OpenAI GPT-4 tokenizer (cl100k_base)",
      "async": false
    },
    {
      "id": "claude",
      "name": "Claude",
      "description": "Anthropic Claude tokenizer",
      "async": false
    },
    {
      "id": "hf:bert-base-uncased",
      "name": "bert-base-uncased",
      "description": "BERT base model (uncased)",
      "async": true
    },
    ...
  ]
}
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed fastify-plugin import error**
- **Found during:** Task 2 - Build failed with "Module 'fastify-plugin' has no exported member 'fp'"
- **Issue:** fastify-plugin exports a default export, not a named 'fp' export
- **Fix:** Changed from `import { fp }` to `import fp from 'fastify-plugin'`
- **Files modified:** server/src/routes/list-models.ts
- **Commit:** 8378412

**2. [Rule 3 - Blocking] Fixed cross-package TypeScript rootDir issue**
- **Found during:** Task 2 - Build failed with rootDir error for src/tokenizers/hf-models.ts
- **Issue:** Attempting to import from CLI src/ directory caused TypeScript rootDir conflicts
- **Fix:** Copied HF_MODELS list inline to server/src/routes/list-models.ts instead of importing
- **Rationale:** Server should be self-contained; duplicating the list is simpler than cross-package compilation
- **Files modified:** server/src/routes/list-models.ts, server/tsconfig.json (reverted)
- **Commit:** 8378412

## Authentication Gates

None - no external services requiring authentication in this plan.

## User Setup Required

None - endpoint works immediately after server starts.

## Next Phase Readiness

**Ready for next phase:**
- GET /api/list-models endpoint functional and tested
- Returns 18 tokenizers with correct format
- Fastify plugin pattern established for future routes

**Delivered artifacts (from must_haves):**
- [x] GET /api/list-models endpoint accessible
- [x] Response includes GPT-4, Claude, and popular Hugging Face models
- [x] Each model entry has id, name, description, and async flag
- [x] Response format matches TokenizerInfo[] type

**Next steps:**
- Plan 05-02 will add file upload endpoint for EPUB processing
- Plan 05-03 will add processing status/result endpoints
- Frontend will use /api/list-models to populate tokenizer selection UI

**Key files for future phases:**
- `server/src/routes/list-models.ts` - Reference for route handler pattern
- `packages/shared/src/types.ts` - TokenizerInfo type for frontend use

---
*Phase: 05-backend-api-file-processing*
*Plan: 01*
*Completed: 2026-01-23*
*Wave: 1 of 3*
