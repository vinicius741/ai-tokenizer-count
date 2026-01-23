# Phase 5: Backend API & File Processing - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fastify server with EPUB processing endpoints, SSE progress streaming, and security hardening. The API supports starting processing jobs, streaming real-time progress via SSE, querying job status, uploading results.json files, and enforcing security (path validation, file upload limits).

This phase is backend infrastructure only — no UI components.

</domain>

<decisions>
## Implementation Decisions

### Background job strategy
- **In-memory queue** (no Redis/BullMQ) — this is a localhost-only app, keep it simple
- **Sequential job processing** — one job at a time, queue additional requests
- **Jobs are processed one at a time** — if a job is running, new jobs wait in queue

### SSE & client disconnect
- **Continue processing after SSE disconnect** — job runs to completion even if user closes browser
- **Job status endpoint required** — provide GET endpoint to query job status/results after disconnection
- **Endpoint structure at Claude's discretion** — path param vs query param is flexible

### API error format
- **Nested error object structure** — `{ error: { code, message, details } }`
- **Error details at Claude's discretion** — level of validation detail is flexible

### Processing behavior
- **Graceful cancellation** — finish current EPUB, then stop (cleaner state, partial results saved)
- **Partial results handling at Claude's discretion** — whether cancelled jobs return partial results
- **Processing limits at Claude's discretion** — whether to add max EPUBs/file size/timeout limits

### Claude's Discretion
- **EPUB processing parallelism** — sequential vs parallel within a job
- **Job data retention** — keep recent jobs vs clear immediately
- **SSE update frequency** — per-EPUB vs batched
- **Job status endpoint structure** — path parameter vs query parameter
- **Machine-readable error codes** — whether to include string codes like 'INVALID_PATH'
- **Validation error detail level** — how much detail to include for validation failures
- **Partial results on cancellation** — whether cancelled jobs return any data
- **Processing limits** — whether to add max EPUBs, max file size, or timeout limits

</decisions>

<specifics>
## Specific Ideas

- Keep it simple — this is a localhost dev tool, not a production SaaS
- User should be able to step away and come back to check status later

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 05-backend-api-file-processing*
*Context gathered: 2026-01-23*
