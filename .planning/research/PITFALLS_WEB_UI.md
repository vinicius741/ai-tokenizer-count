# Domain Pitfalls: Adding Web UI to CLI Tool

**Domain:** React + shadcn/ui Web UI for Existing TypeScript CLI
**Researched:** 2026-01-22
**Confidence:** MEDIUM (WebSearch verified, multiple credible sources)

## Overview

This document covers common mistakes when adding a React + shadcn/ui Web UI to an existing TypeScript CLI application. These pitfalls are specific to the integration challenge: making a CLI tool work as a web application while maintaining the existing CLI functionality.

---

## Architecture & Monorepo Pitfalls

### Pitfall 1: Monorepo Over-Engineering
- **What goes wrong:** Setting up complex monorepo tooling (Turborepo, Nx) for a simple CLI + Web UI project
- **Why it happens:** "Best practice" articles recommend monorepos for full-stack TypeScript, but the complexity outweighs benefits for small projects
- **Consequences:**
  - Hours spent on configuration instead of features
  - Build complexity that blocks contributors
  - Package dependency hell between frontend/backend
  - TypeScript configuration conflicts that are hard to debug
- **Prevention:**
  - **Start with separate packages in same repo** without formal monorepo tooling
  - Use simple `package.json` workspace configuration if needed
  - Only add Turborepo/Nx if you have 5+ packages or complex build orchestration needs
  - For CLI + Web UI, two packages are manageable without tooling
- **Detection:** You're spending more time configuring builds than writing features
- **Phase to address:** Phase 1 (Project setup) - choose architecture upfront
- **Sources:**
  - [Streamlining Full-Stack TypeScript Development with Monorepos](https://leapcell.io/blog/streamlining-full-stack-typescript-development-with-monorepos) - MEDIUM confidence
  - [Creating a TypeScript CLI for Your Monorepo](https://dev.to/zirkelc/creating-a-typescript-cli-for-your-monorepo-5aa) - MEDIUM confidence

### Pitfall 2: TypeScript Configuration Mismatch
- **What goes wrong:** Frontend and backend can't share types because `tsconfig.json` settings conflict
- **Why it happens:** Vite (bundler mode) and Node.js (NodeNext) have different module resolution strategies
- **Consequences:**
  - Type errors when importing shared code
  - "Cannot find module" errors that work in IDE but fail in build
  - Duplicate type definitions across packages
  - `any` types used to bypass errors, losing type safety
- **Prevention:**
  - **Create a shared types package** (`packages/shared-types`) with its own `tsconfig.json`
  - Use `module: "ESNext"` and `moduleResolution: "bundler"` for shared types
  - For Vite frontend: extend base config with `moduleResolution: "bundler"`
  - For Node.js backend: extend base config with `moduleResolution: "NodeNext"`
  - **Critical:** Use `composite: true` and `references` for TypeScript project references
  - Test builds in CI (IDE type checking != build type checking)
- **Detection:** Build fails with module resolution errors that don't appear in IDE
- **Phase to address:** Phase 1 (Project setup) - TypeScript strategy must be decided first
- **Sources:**
  - [A New Nx Experience for TypeScript Monorepos](https://nx.dev/blog/new-nx-experience-for-typescript-monorepos) - HIGH confidence (official Nx docs)
  - [Turborepo TypeScript configuration issues](https://stackoverflow.com/questions/79824116/typescript-cannot-resolve-repo-typescript-config-backends-json-in-turborepo) - HIGH confidence (real issue)
  - [Vite GitHub Issue #191 - Module resolution in monorepos](https://github.com/vitejs/vite/issues/191) - HIGH confidence

### Pitfall 3: Path Alias Hell (shadcn/ui Specific)
- **What goes wrong:** `@/components` works in CLI but fails in build, or vice versa
- **Why it happens:** shadcn/ui uses path aliases; Vite and TypeScript resolve them differently
- **Consequences:**
  - Components work in dev but fail in production build
  - `shadcn add` creates files in wrong directory
  - Import errors that only appear after `npm run build`
- **Prevention:**
  - **Configure paths in BOTH `tsconfig.json` AND `vite.config.ts`**
  - Ensure `baseUrl` and `paths` are inside `compilerOptions`, not at root of tsconfig
  - For monorepos: configure `@/` aliases in each package's config, not just root
  - Test shadcn component creation: `npx shadcn add button` and verify location
  - Use `components.json` configuration file for shadcn CLI consistency
  - **Critical:** Run production build early to catch alias issues
- **Detection:** Dev works but `npm run build` fails with "Cannot find module" errors
- **Phase to address:** Phase 1 (Project setup) - alias configuration must work before adding components
- **Sources:**
  - [shadcn/ui Vite installation docs](https://ui.shadcn.com/docs/installation/vite) - HIGH confidence (official)
  - [shadcn path aliasing in monorepo #6752](https://github.com/shadcn-ui/ui/discussions/6752) - HIGH confidence (official discussion)
  - [Vite Alias Configuration Issue #4253](https://github.com/shadcn-ui/ui/issues/4253) - HIGH confidence (official issue)
  - [Import aliasing won't work in Vite StackOverflow](https://stackoverflow.com/questions/78737207/import-aliasing-wont-work-in-vite-react-typescript-boilerplate) - HIGH confidence

### Pitfall 4: Hot Module Replacement (HMR) Breaks in Monorepo
- **What goes wrong:** Changes in shared packages don't trigger frontend rebuild
- **Why it happens:** Vite doesn't watch dependencies in monorepo packages by default
- **Consequences:**
  - Developer changes code,刷新es, sees no changes
  - Wastes time thinking code is broken when it's just not reloaded
  - Manual restarts needed after every shared package change
- **Prevention:**
  - Configure `server.watch` in `vite.config.ts` to include package dependencies
  - Use `optimizeDeps.exclude` for shared packages to force rebundling
  - Consider using Turborepo's `turbo dev` command if this becomes chronic
  - Document HMR limitations for team members
- **Detection:** You're manually restarting dev server constantly
- **Phase to address:** Phase 1 (Project setup) - HMR must work before feature development
- **Sources:**
  - [Vite GitHub Issue #10447 - HMR for monorepo packages](https://github.com/vitejs/vite/issues/10447) - HIGH confidence

---

## State Management Pitfalls

### Pitfall 5: Over-Engineering State Management
- **What goes wrong:** Adding Redux/Zustand when React Context or simple useState would suffice
- **Why it happens:** "State management is complex" mindset, choosing tools before understanding requirements
- **Consequences:**
  - Unnecessary boilerplate (actions, reducers, providers)
  - Steeper learning curve for contributors
  - Debugging complexity (Redux DevTools, middleware)
  - Over-engineering for simple needs (UI is just displaying CLI results)
- **Prevention:**
  - **Start with useState/useContext** - only add state management library if you hit actual problems
  - For this project: likely needs only:
    - Local state for form inputs (selected tokenizer, file paths)
    - Context for theme (dark/light mode)
    - No global state needed if API returns all data in one response
  - Use React Query/SWR if caching API responses (but may not need for simple app)
  - **Zustand over Redux:** If you need global state, Zustand has minimal boilerplate
  - Measure performance before optimizing - premature optimization is root of evil
- **Detection:** You're writing reducers for simple UI state
- **Phase to address:** Phase 2 (Frontend development) - choose state strategy before coding
- **Sources:**
  - [React State Management in 2025: What You Actually Need](https://www.developerway.com/posts/react-state-management-2025) - HIGH confidence
  - [Zustand vs Redux vs Context API: State Management Guide](https://www.salmanizhar.com/blog/zustand-redux-context-api-comparison) - HIGH confidence
  - [What's the Best Way to Manage State in React?](https://javascript-conference.com/blog/react-state-management-context-zustand-jotai) - HIGH confidence (emphasizes avoiding over-engineering)

### Pitfall 6: Prop Drilling vs Context Overuse
- **What goes wrong:** Either drilling props through 5 components OR putting everything in Context
- **Why it happens:** No clear heuristic for when to use each approach
- **Consequences:**
  - **Prop drilling:** Components polluted with props they don't use
  - **Context overuse:** Everything re-renders when Context changes (performance)
  - Both increase coupling and make components hard to reuse
- **Prevention:**
  - **Use Context for:**
    - Theme (dark/light mode)
    - User preferences
    - Authentication state (if added later)
  - **Use prop drilling for:**
    - Component-specific configuration
    - Data that only 2-3 components need
  - **Use compound pattern** for shared state in component trees (e.g., `<Tabs><Tabs.List><Tabs.Panel>`)
  - **Consider URL state** for filterable data (tokenizers, file selections) - shareable via URL
- **Detection:** More than 3 levels of prop passing OR Context causes full-app re-renders
- **Phase to address:** Phase 2 (Frontend development) - establish patterns early
- **Sources:**
  - [Stop Using Context API Now: Detailed Comparison](https://javascript.plainenglish.io/redux-vs-context-api-vs-zustand-download-cheat-sheet-43c3af82826e) - MEDIUM confidence

---

## API Design Pitfalls

### Pitfall 7: Over-Fetching / Under-Fetching Data
- **What goes wrong:** API returns too much data (slow) or too little (multiple requests)
- **Why it happens:** No upfront API design; endpoints mirror CLI structure instead of UI needs
- **Consequences:**
  - **Over-fetching:** Slow responses, unnecessary bandwidth, frontend filtering
  - **Under-fetching:** Waterfall requests (get book list, then get each book's details)
  - Poor UX (loading spinners, slow page loads)
- **Prevention:**
  - **Design API from UI needs first:**
    - List view: endpoint that returns summary for all books (one request)
    - Detail view: endpoint that returns full details for one book
    - Processing status: SSE endpoint for progress updates (not polling)
  - **Use GraphQL or tRPC if needed** but REST is fine for simple use cases
  - **Avoid:** Returning all CLI data in one giant response (1000+ EPUBs = MBs of JSON)
  - **Avoid:** Frontend making 20 requests to populate one page
  - **Pagination:** Implement pagination for book lists (don't return 10,000 books at once)
  - **Field selection:** Allow frontend to specify which fields it needs (`?fields=title,tokenCount`)
- **Detection:** Frontend makes multiple requests in `useEffect` chain OR API returns 5MB JSON
- **Phase to address:** Phase 2 (API design) - design endpoints before frontend
- **Sources:**
  - [AWS: GraphQL vs REST - Over-fetching and Under-fetching](https://aws.amazon.com/compare/the-difference-between-graphql-and-rest/) - HIGH confidence (official AWS)
  - [REST vs GraphQL: How to Make the Right Choice](https://strapi.io/blog/graph-ql-vs-graphql-how-to-make-the-right-choice) - HIGH confidence

### Pitfall 8: Ignoring Real-Time Progress Updates
- **What goes wrong:** User clicks "Process EPUBs" and sees no feedback for 2 minutes
- **Why it happens:** API is designed as request/response, not streaming
- **Consequences:**
  - Users think app is broken
  - Users re-submit requests, creating duplicate work
  - Poor UX compared to CLI (which has progress bars)
- **Prevention:**
  - **Use Server-Sent Events (SSE)** for progress updates (simpler than WebSockets)
  - Design: `POST /api/process` returns job ID, client connects to `GET /api/process/:id/events`
  - SSE events: `{ progress: 50, currentFile: "book.epub", status: "processing" }`
  - **Alternative:** Polling endpoint with `?lastId` for incremental updates
  - **Fallback:** If implementing SSE is too complex, at minimum show "Processing..." spinner with estimated time
  - **Why SSE over WebSockets:** One-way (server → client), uses HTTP, simpler setup
- **Detection:** No user feedback during long-running operations
- **Phase to address:** Phase 2 (API design) - progress streaming is UX requirement
- **Sources:**
  - [Why Server-Sent Events Beat WebSockets for 95% of Real-Time Cloud Applications](https://medium.com/codetodeploy/why-server-sent-events-beat-websockets-for-95-of-real-time-cloud-applications-830eff5a1d7c) - MEDIUM confidence
  - [Real-Time Updates with SSE in Node.js & React.js](https://basirblog.hashnode.dev/welcome-to-the-magic-real-time-updates-with-server-sent-events-sse-in-nodejs-reactjs) - HIGH confidence (specific to Node + React)
  - [freeCodeCamp: Server-Sent Events vs WebSockets](https://www.freecodecamp.org/news/server-sent-events-vs-websockets/) - HIGH confidence

### Pitfall 9: No Background Job Queue
- **What goes wrong:** Long-running EPUB processing blocks HTTP request, causing timeouts
- **Why it happens:** Running processing synchronously in HTTP request handler
- **Consequences:**
  - Request timeouts (browser gives up after 30-120 seconds)
  - Server unresponsive during processing
  - No progress feedback possible
  - Can't cancel or pause jobs
- **Prevention:**
  - **Use job queue pattern:**
    - `POST /api/process` creates job, returns job ID immediately
    - Background worker processes job (could be separate process or same process)
    - Client polls/SSEs for status
  - **Libraries:** BullMQ (Redis-based) or simple in-memory queue for single-server
  - **For localhost-only app:** In-memory queue is sufficient (no Redis needed)
  - **Critical:** Don't block request handler for long-running tasks
  - Store job results temporarily (filesystem or in-memory) for client to fetch
- **Detection:** HTTP requests take >10 seconds or timeout
- **Phase to address:** Phase 2 (Backend architecture) - async job pattern is foundational
- **Sources:**
  - [How we handle long-running tasks in NodeJS](https://0x2c6.medium.com/how-we-handle-long-running-tasks-in-nodejs-6c6dc671c0cd) - HIGH confidence
  - [BullMQ - Background Jobs processing](https://bullmq.io/) - HIGH confidence (official docs)
  - [Execute long-running jobs in the background [Node.js]](https://levelup.gitconnected.com/execute-long-running-jobs-in-the-background-node-js-e74e12163fef) - HIGH confidence

---

## Security Pitfalls

### Pitfall 10: Path Traversal Vulnerability
- **What goes wrong:** User accesses `../../etc/passwd` via "select folder" feature
- **Why it happens:** Trusting user input for file system paths without validation
- **Consequences:**
  - **CRITICAL SECURITY ISSUE:** Arbitrary file read access
  - Users can read any file on server
  - Credentials, keys, sensitive data exposed
  - CVE-worthy vulnerability
- **Prevention:**
  - **Never trust user input for file paths**
  - Validate all paths against allow-listed directories
  - Use `path.normalize()` and `path.resolve()` to canonicalize paths
  - Check resolved path is within allowed directory:
    ```typescript
    const resolved = path.resolve(allowDir, userInput);
    if (!resolved.startsWith(allowDir)) {
      throw new Error('Path traversal detected');
    }
    ```
  - Use Node.js `fs.stat()` to verify path exists and is directory
  - **Special concern:** Windows has reserved device names (`CON`, `PRN`, `NUL`) that bypass path validation
  - Consider using a library like `path-is-inside` for validation
  - **Critical:** Test path traversal attempts before deployment
- **Detection:** You're using user input in `fs.readFile()` without validation
- **Phase to address:** Phase 2 (Backend security) - must be secure before any file access feature
- **Sources:**
  - [Node.js Path Traversal on Windows: CVE-2025-27210](https://zeropath.com/blog/cve-2025-27210-nodejs-path-traversal-windows) - HIGH confidence (CVE)
  - [Node.js Path Traversal Guide: Examples and Prevention](https://www.stackhawk.com/blog/node-js-path-traversal-guide-examples-and-prevention/) - HIGH confidence
  - [Directory Traversal in node CVE-2025-23084](https://security.snyk.io/vuln/SNYK-UPSTREAM-NODE-8651420) - HIGH confidence (CVE)
  - [NodeJS 24.x - Path Traversal - Live Threat Intelligence](https://radar.offseq.com/threat/nodejs-24x-path-traversal-7f1f742a) - HIGH confidence

### Pitfall 11: No Input Validation on EPUB Upload
- **What goes wrong:** Users upload malicious files, large files, or non-EPUBs
- **Why it happens:** "It's localhost-only, why secure it?" mindset
- **Consequences:**
  - DoS via large file upload (upload 10GB file, crash server)
  - Malicious file execution (if server processes uploaded files improperly)
  - Server disk exhaustion
- **Prevention:**
  - **Validate file type:** Check MIME type and file extension
  - **Validate file size:** Reject files >500MB (configurable)
  - **Validate EPUB structure:** Parse EPUB before processing, reject if malformed
  - Use virus scanning if processing untrusted uploads (even for localhost)
  - Rate limit upload endpoints (prevent rapid upload spam)
  - Store uploads in temporary directory, clean up after processing
  - **Never execute uploaded files** (obvious but worth stating)
  - Consider using express-file-upload or multer for safe file handling
- **Detection:** Upload endpoint accepts any file without validation
- **Phase to address:** Phase 2 (Backend security) - must be secure before file upload feature
- **Sources:**
  - [Next.js 15 File Upload with Server Actions Tutorial](https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions) - HIGH confidence (covers validation)
  - [AWS S3 Upload with Next.js Server Actions and Zod Validation](https://medium.com/@christopher_28348/aws-s3-upload-with-next.js-server-actions-and-zod-validation-dd3a2410bba4) - HIGH confidence

### Pitfall 12: CORS and Security Headers Missing
- **What goes wrong:** Browser blocks API requests or app vulnerable to XSS
- **Why it happens:** "Localhost only" mindset, forgetting security fundamentals
- **Consequences:**
  - CORS errors prevent frontend from talking to backend
  - XSS attacks via unsanitized output
  - Clickjacking if site is embedded in iframe
- **Prevention:**
  - **For localhost development:**
    - CORS: Allow `http://localhost:5173` (Vite dev server) explicitly
    - Don't use `origin: '*'` (too permissive)
  - **Production hardening (even for localhost):**
    - Set `Content-Security-Policy` header
    - Set `X-Frame-Options: DENY` to prevent clickjacking
    - Set `X-Content-Type-Options: nosniff`
    - Use `helmet` npm package for security headers
  - **Sanitize all user input** before displaying (use DOMPurify if displaying user content)
  - Validate all file paths before displaying (prevent XSS via filenames)
- **Detection:** Browser console shows CORS errors or security warnings
- **Phase to address:** Phase 2 (Backend security) - must work before frontend integration
- **Sources:**
  - [Serve React SPAs with Express: Caching, Compression, Security](https://medium.com/@gaankit99/serve-react-spas-with-express-caching-compression-security-logging-d2be58b54009) - HIGH confidence

---

## Build Configuration Pitfalls

### Pitfall 13: npm Scripts Don't Work in Monorepo
- **What goes wrong:** `npm run build` works in one package but fails in another
- **Why it happens:** Root scripts vs package scripts confusion, missing `pre`/`post` hooks
- **Consequences:**
  - Developers use different commands (inconsistent workflow)
  - CI/CD fails because scripts assume different directory structure
  - "Works on my machine" issues
- **Prevention:**
  - **Document all commands** in README (e.g., "From root: `npm run build:web`")
  - Use `turbo run build` if using Turborepo (runs in correct package context)
  - Use `--workspace` flag with pnpm if using workspaces
  - For simple monorepo: prefix commands with package name (`npm run build --workspace=web`)
  - **Critical:** Test build from clean checkout (no node_modules)
  - Add `prebuild` scripts if dependencies must build first
- **Detection:** README has inconsistent instructions or developers memorize special commands
- **Phase to address:** Phase 1 (Project setup) - build process must be reliable
- **Sources:**
  - [Turborepo, React Native, TypeScript, and ESLint](https://javascript.plainenglish.io/turborepo-react-native-typescript-and-eslint-af33b71daa85) - MEDIUM confidence
  - [Best Practices for TypeScript Monorepo](https://atrociousblog.hashnode.dev/best-practices-for-typescript-monorepo) - MEDIUM confidence

### Pitfall 14: Missing Shared Code Between CLI and Web
- **What goes wrong:** Copy-pasting logic between CLI and backend instead of sharing
- **Why it happens:** No shared package, or shared package doesn't work due to ESM/CJS conflicts
- **Consequences:**
  - Bug fix in CLI must be manually applied to backend
  - Divergent behavior between CLI and web (confusing for users)
  - Code rot in duplicated sections
- **Prevention:**
  - **Create shared package:** `packages/shared` with reusable logic
  - Extract pure functions to shared:
    - EPUB parsing (if not library-dependent)
    - Text extraction logic
    - Token counting wrapper
    - Metadata extraction
  - **ESM/CJS compatibility:**
    - Use `"type": "module"` in package.json (ESM)
    - Or use `tsup`/`esbuild` to dual-emit ESM and CJS
    - Test import from both ESM (frontend) and CJS (Node backend)
  - **Keep CLI-specific code separate:** progress bars, CLI args, terminal output
  - **Keep web-specific code separate:** API routes, React components
- **Detection:** You're fixing the same bug in two places
- **Phase to address:** Phase 1 (Architecture) - shared code strategy must be decided upfront
- **Sources:**
  - [TypeScript Monorepo Setup: Sharing Types Between Workers](https://www.outstand.so/blog/typescript-monorepo-setup) - MEDIUM confidence

---

## Frontend Performance Pitfalls

### Pitfall 15: Over-Memoization with React Hooks
- **What goes wrong:** Wrapping everything in `useMemo`, `useCallback`, `React.memo` "for performance"
- **Why it happens:** "Memoization is good" mindset without measuring actual bottlenecks
- **Consequences:**
  - Code complexity: dependency arrays, wrapper functions
  - Worse performance: memoization overhead exceeds cost of re-render
  - Harder to read: intent obscured by optimization noise
  - **Irony:** Performance optimizations often make code slower
- **Prevention:**
  - **Don't memoize unless you measure a problem**
  - Use React DevTools Profiler to find slow renders
  - **Memoize only:**
    - Expensive computations (filtering 10,000+ items)
    - Referential stability for props passed to memoized children
    - Values used in useEffect dependencies
  - **Don't memoize:**
    - Simple calculations (string concatenation, basic math)
    - Component render functions (unless profiled as slow)
    - Functions created in render (unless passed to memoized child)
  - Remove `useMemo`/`useCallback` if you added them "just in case"
- **Detection:** More than 20% of components use `useMemo`/`useCallback`
- **Phase to address:** Phase 3 (Performance optimization) - optimize after measuring
- **Sources:**
  - [How to useMemo and useCallback: you can remove most of them](https://www.developerway.com/posts/how-to-use-memo-use-callback) - HIGH confidence (specifically about removing over-memoization)
  - [On Overusing useCallback/useMemo in React](https://www.reddit.com/r/reactjs/comments/1mnaj2t/on_overusing_usecallbackusememo_in_react_whats/) - HIGH confidence (community discussion)
  - [React useMemo vs. useCallback: A pragmatic guide](https://blog.logrocket.com/react-usememo-vs-usecallback/) - HIGH confidence

### Pitfall 16: Chart Library Performance Issues
- **What goes wrong:** Page freezes when rendering charts with 1000+ data points
- **Why it happens:** Using chart library that can't handle large datasets (Recharts is notorious for this)
- **Consequences:**
  - Browser hangs, user thinks app crashed
  - Slow interactions (hovering, filtering)
  - Memory leaks with multiple charts
- **Prevention:**
  - **Choose chart library based on data size:**
    - **<100 points:** Any library (Recharts, Chart.js, Victory)
    - **100-1000 points:** Chart.js or ECharts (better performance)
    - **1000+ points:** ECharts or custom Canvas-based rendering
  - **For this project:** If showing 1000+ EPUBs, use ECharts or aggregate data
  - **Implementation strategies:**
    - Virtualization: only render visible points (react-window, react-virtualized)
    - Aggregation: show averages/bins instead of raw data
    - Lazy loading: render charts after page load
    - Pagination: show 100 items per page
  - **Critical:** Test with realistic data (1000 EPUBs) during development
  - Profile Chrome DevTools Performance tab for rendering time
- **Detection:** Page load time >5 seconds or browser hangs during interaction
- **Phase to address:** Phase 2 (Chart selection) - choose library before building visualizations
- **Sources:**
  - [Comparing 8 Popular React Charting Libraries](https://medium.com/@ponshriharini/comparing-8-popular-react-charting-libraries-performance-features-and-use-cases-cc178d80b3ba) - MEDIUM confidence (2025 comparison)
  - [Best React chart libraries (2025 update)](https://blog.logrocket.com/best-react-chart-libraries-2025/) - HIGH confidence (2025 review)
  - [D3.js vs Chart.js vs Plotly vs Recharts: Complete 2025 Comparison](https://chartomize.com/blog/d3-vs-chartjs-comparison) - HIGH confidence (includes benchmarks)

### Pitfall 17: Large Bundle Size
- **What goes wrong:** Initial JavaScript bundle is >500KB, takes 10+ seconds to load
- **Why it happens:** Including entire chart library, heavy dependencies, no code-splitting
- **Consequences:**
  - Poor UX: slow initial load
  - Poor perceived performance
  - Higher bandwidth usage
  - Works on localhost but slow on remote servers
- **Prevention:**
  - **Audit bundles:** `npm run build` shows bundle size, use `rollup-plugin-visualizer`
  - **Code splitting:**
    - Lazy load chart components: `const Charts = lazy(() => import('./Charts'))`
    - Lazy load heavy libraries (don't import chart lib until needed)
  - **Tree shaking:**
    - Use ESM imports (`import { Bar } from 'recharts'` not `import * as Recharts`)
    - Check bundle for unused code
  - **Choose lightweight libraries:**
    - Recharts: ~200KB
    - Chart.js: ~60KB
    - Consider ECharts for better performance/larger datasets
  - **Target:** <200KB initial bundle (gzipped) for reasonable load time
- **Detection:** `npm run build` shows bundle >500KB uncompressed
- **Phase to address:** Phase 3 (Performance optimization) - measure after feature complete
- **Sources:**
  - [Best React chart libraries (2025 update)](https://blog.logrocket.com/best-react-chart-libraries-2025/) - HIGH confidence (includes bundle sizes)

---

## Integration-Specific Pitfalls

### Pitfall 18: Losing CLI Features in Web UI
- **What goes wrong:** Web UI can't do things CLI can do (feature parity gap)
- **Why it happens:** Web UI built as separate product, not interface to existing CLI
- **Consequences:**
  - Users confused: "Why can't I do X in the web UI?"
  - Fragmented experience: must use CLI for some tasks, web for others
  - Web UI feels like "demo" not "full product"
- **Prevention:**
  - **Web UI should expose ALL CLI features:**
    - All tokenizer options (presets and custom)
    - All CLI flags (max-mb, jobs, etc.)
    - Same error messages and validation
    - Same output options (JSON, Markdown)
  - **Design API from CLI interface:**
    - API routes should mirror CLI commands
    - Use same validation logic
    - Share error handling code
  - **Document CLI features in web UI:**
    - Help tooltips explaining options
    - Link to CLI documentation
  - **Critical:** Test feature parity checklist before release
- **Detection:** Web UI has subset of CLI options
- **Phase to address:** Phase 2 (API design) - API must support all CLI features
- **Sources:**
  - (No specific sources, this is general integration advice based on full-stack development patterns)

### Pitfall 19: No Shared Validation Logic
- **What goes wrong:** CLI validates one way, web UI validates another way
- **Why it happens:** Validation logic is duplicated, not shared
- **Consequences:**
  - Different error messages for same error
  - One accepts invalid input, other rejects it
  - Users confused by inconsistent behavior
- **Prevention:**
  - **Extract validation to shared package:**
    - `validateTokenizer(model: string): Result`
    - `validateFilePath(path: string): Result`
    - `validateMaxMb(size: number): Result`
  - Use Zod or Yup for schema validation (works in both CLI and backend)
  - **Critical:** Share validation schemas between frontend and backend
  - Use same error types/messages in both interfaces
- **Detection:** You're fixing validation bugs in two places
- **Phase to address:** Phase 2 (Backend architecture) - shared validation must be designed upfront
- **Sources:**
  - [AWS S3 Upload with Next.js Server Actions and Zod Validation](https://medium.com/@christopher_28348/aws-s3-upload-with-next.js-server-actions-and-zod-validation-dd3a2410bba4) - HIGH confidence (Zod validation pattern)

### Pitfall 20: Assuming "Localhost Only" Means "No Security"
- **What goes wrong:** "It's only running on localhost, why worry about security?"
- **Why it happens:** False sense of security, forgetting that localhost apps can be exploited
- **Consequences:**
  - If user forwards port (SSH tunnel, ngrok), app exposed to internet
  - If user has malware on localhost, app is attack surface
  - Bad habits carry to production deployments
  - Data loss/corruption from malicious input
- **Prevention:**
  - **Treat localhost as production for security:**
    - Validate all input (even if "trusted" user)
    - Sanitize all output (XSS prevention)
    - Use safe file handling (path traversal prevention)
    - Set security headers (helmet)
  - **Bind to 127.0.0.1 only** (not 0.0.0.0) to prevent external access
  - Document security assumptions: "This app is designed for localhost-only use"
  - **Add warning if accessed from non-localhost:**
    - Detect `req.hostname` !== 'localhost'
    - Show banner: "WARNING: Not designed for production deployment"
  - Consider adding authentication option (even if not required by default)
- **Detection:** README says "localhost only" but code has no security checks
- **Phase to address:** Phase 2 (Backend security) - secure by default, even for localhost
- **Sources:**
  - [Node.js Path Traversal on Windows: CVE-2025-27210](https://zeropath.com/blog/cve-2025-27210-nodejs-path-traversal-windows) - HIGH confidence (shows even localhost apps have vulnerabilities)

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| **Phase 1: Project Setup** | #1, #2, #3 - Monorepo over-engineering, TypeScript mismatch, path alias hell | Start simple (2 packages), design TypeScript sharing strategy upfront, configure aliases in both Vite and tsconfig, test production build early |
| **Phase 1: Shared Code** | #14 - Missing shared code between CLI and web | Create `packages/shared` before writing features, decide ESM/CJS strategy, test imports from both frontend and backend |
| **Phase 2: Backend Architecture** | #7, #8, #9 - Over/under-fetching, no real-time updates, no job queue | Design API from UI needs first, implement SSE for progress, use job queue pattern for long-running tasks |
| **Phase 2: Backend Security** | #10, #11, #12 - Path traversal, no upload validation, missing security headers | Validate all file paths, validate uploaded files (size, type), use helmet for security headers, bind to 127.0.0.1 |
| **Phase 2: Frontend Development** | #5, #6 - Over-engineering state management, prop drilling/context overuse | Start with useState/useContext, only add state library if needed, use URL state for filters, measure performance before optimizing |
| **Phase 2: API Integration** | #18, #19 - Losing CLI features, no shared validation | Web UI must expose ALL CLI features, extract validation to shared package, use Zod for schemas |
| **Phase 3: Performance** | #15, #16, #17 - Over-memoization, chart performance, large bundle | Don't memoize without measuring, choose chart library based on data size (ECharts for 1000+ points), code split heavy components |
| **All Phases** | #20 - "Localhost only" security mindset | Secure by default: validate input, sanitize output, prevent path traversal, use security headers |

---

## Most Critical Pitfalls (Top 5 for Web UI Integration)

1. **Pitfall #10 (Path Traversal)** - CRITICAL SECURITY: Arbitrary file read vulnerability, CVE-worthy
2. **Pitfall #3 (Path Alias Hell)** - Blocks development: shadcn/ui breaks in monorepo, wastes hours debugging
3. **Pitfall #8 (No Real-Time Updates)** - UX disaster: 2-minute processing with no feedback, users think app is broken
4. **Pitfall #9 (No Job Queue)** - Technical debt blocking: HTTP timeouts, server unresponsive, can't cancel jobs
5. **Pitfall #18 (Losing CLI Features)** - Product failure: Web UI feels incomplete, users frustrated by missing features

---

## Integration Checklist

Before starting Web UI development, verify:

- [ ] Monorepo structure decided (formal tooling vs simple packages)
- [ ] TypeScript sharing strategy designed (shared package, ESM/CJS)
- [ ] Path aliases configured in both `vite.config.ts` and `tsconfig.json`
- [ ] Production build tested (`npm run build` works without errors)
- [ ] API endpoints designed from UI needs (not just mirroring CLI)
- [ ] Real-time progress update strategy chosen (SSE recommended)
- [ ] Background job queue pattern planned (BullMQ or in-memory)
- [ ] Security requirements documented (path validation, input validation)
- [ ] State management strategy decided (start simple, add complexity if needed)
- [ ] Chart library selected based on expected data size
- [ ] CLI → Web feature parity checklist created

---

## Sources

### Architecture & Monorepo
- [Streamlining Full-Stack TypeScript Development with Monorepos](https://leapcell.io/blog/streamlining-full-stack-typescript-development-with-monorepos) - MEDIUM confidence
- [Creating a TypeScript CLI for Your Monorepo](https://dev.to/zirkelc/creating-a-typescript-cli-for-your-monorepo-5aa) - MEDIUM confidence
- [A New Nx Experience for TypeScript Monorepos](https://nx.dev/blog/new-nx-experience-for-typescript-monorepos) - HIGH confidence (official Nx)
- [Turborepo TypeScript configuration StackOverflow](https://stackoverflow.com/questions/79824116/typescript-cannot-resolve-repo-typescript-config-backends-json-in-turborepo) - HIGH confidence
- [Vite Module Resolution in Monorepos #191](https://github.com/vitejs/vite/issues/191) - HIGH confidence
- [Vite HMR for Monorepo Packages #10447](https://github.com/vitejs/vite/issues/10447) - HIGH confidence
- [Turborepo, React Native, TypeScript, and ESLint](https://javascript.plainenglish.io/turborepo-react-native-typescript-and-eslint-af33b71daa85) - MEDIUM confidence
- [TypeScript Monorepo Setup: Sharing Types Between Workers](https://www.outstand.so/blog/typescript-monorepo-setup) - MEDIUM confidence

### shadcn/ui Specific
- [shadcn/ui Vite Installation Docs](https://ui.shadcn.com/docs/installation/vite) - HIGH confidence (official)
- [shadcn Path Aliasing in Monorepo #6752](https://github.com/shadcn-ui/ui/discussions/6752) - HIGH confidence (official discussion)
- [Vite Alias Configuration Issue #4253](https://github.com/shadcn-ui/ui/issues/4253) - HIGH confidence (official issue)
- [Issue with Alias with Vite #1844](https://github.com/shadcn-ui/ui/issues/1844) - HIGH confidence (official issue)
- [Import Aliasing Won't Work in Vite StackOverflow](https://stackoverflow.com/questions/78737207/import-aliasing-wont-work-in-vite-react-typescript-boilerplate) - HIGH confidence
- [Turborepo + Vite + TypeScript + TailwindCss + ShadCn](https://medium.com/@david.kopcok123/turborepo-vite-typescript-tailwindcss-shadcn-e711d89c743c) - MEDIUM confidence
- [How to Add Shadcn UI into an Existing React App in Nx Monorepo](https://pustelto.com/blog/adding-shadcnui-to-nx-monorepo/) - MEDIUM confidence

### State Management
- [React State Management in 2025: What You Actually Need](https://www.developerway.com/posts/react-state-management-2025) - HIGH confidence
- [Zustand vs Redux vs Context API: State Management Guide](https://www.salmanizhar.com/blog/zustand-redux-context-api-comparison) - HIGH confidence
- [What's the Best Way to Manage State in React?](https://javascript-conference.com/blog/react-state-management-context-zustand-jotai) - HIGH confidence (emphasizes avoiding over-engineering)
- [Stop Using Context API Now: Detailed Comparison](https://javascript.plainenglish.io/redux-vs-context-api-vs-zustand-download-cheat-sheet-43c3af82826e) - MEDIUM confidence

### API Design & Real-Time Updates
- [AWS: GraphQL vs REST - Over-fetching and Under-fetching](https://aws.amazon.com/compare/the-difference-between-graphql-and-rest/) - HIGH confidence (official AWS)
- [REST vs GraphQL: How to Make the Right Choice](https://strapi.io/blog/graph-ql-vs-graphql-how-to-make-the-right-choice) - HIGH confidence
- [Why Server-Sent Events Beat WebSockets for 95% of Real-Time Cloud Applications](https://medium.com/codetodeploy/why-server-sent-events-beat-websockets-for-95-of-real-time-cloud-applications-830eff5a1d7c) - MEDIUM confidence
- [Real-Time Updates with SSE in Node.js & React.js](https://basirblog.hashnode.dev/welcome-to-the-magic-real-time-updates-with-server-sent-events-sse-in-nodejs-reactjs) - HIGH confidence (Node + React specific)
- [freeCodeCamp: Server-Sent Events vs WebSockets](https://www.freecodecamp.org/news/server-sent-events-vs-websockets/) - HIGH confidence
- [Real-Time Updates in Web Apps: Why I Chose SSE Over WebSockets](https://dev.to/okrahul/real-time-updates-in-web-apps-why-i-chose-sse-over-websockets-k8k) - MEDIUM confidence

### Background Jobs & Long-Running Tasks
- [How we handle long-running tasks in NodeJS](https://0x2c6.medium.com/how-we-handle-long-running-tasks-in-nodejs-6c6dc671c0cd) - HIGH confidence
- [BullMQ - Background Jobs processing](https://bullmq.io/) - HIGH confidence (official docs)
- [Execute long-running jobs in the background [Node.js]](https://levelup.gitconnected.com/execute-long-running-jobs-in-the-background-node-js-e74e12163fef) - HIGH confidence
- [How to perform recurring long running background tasks in Node.js web server StackOverflow](https://stackoverflow.com/questions/70377015/how-to-perform-recurring-long-running-background-tasks-in-an-node-js-web-server) - MEDIUM confidence

### Security
- [Node.js Path Traversal on Windows: CVE-2025-27210](https://zeropath.com/blog/cve-2025-27210-nodejs-path-traversal-windows) - HIGH confidence (CVE)
- [Node.js Path Traversal Guide: Examples and Prevention](https://www.stackhawk.com/blog/node-js-path-traversal-guide-examples-and-prevention/) - HIGH confidence
- [Directory Traversal in node CVE-2025-23084](https://security.snyk.io/vuln/SNYK-UPSTREAM-NODE-8651420) - HIGH confidence (CVE)
- [NodeJS 24.x - Path Traversal - Live Threat Intelligence](https://radar.offseq.com/threat/nodejs-24x-path-traversal-7f1f742a) - HIGH confidence
- [Node.js API Security Vulnerabilities with Path Traversal in files-bucket-server](https://www.nodejs-security.com/blog/nodejs-api-security-vulnerabilities-path-traversal-files-bucket-server) - HIGH confidence
- [Node.js Vulnerabilities: Path Traversal & HashDoS Risks](https://aardwolfsecurity.com/critical-nodejs-vulnerabilities-expose-windows-applications-to-path-traversal-and-hashdos-attacks/) - HIGH confidence
- [Next.js 15 File Upload with Server Actions Tutorial](https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions) - HIGH confidence (covers validation)
- [AWS S3 Upload with Next.js Server Actions and Zod Validation](https://medium.com/@christopher_28348/aws-s3-upload-with-next.js-server-actions-and-zod-validation-dd3a2410bba4) - HIGH confidence (Zod validation)
- [Serve React SPAs with Express: Caching, Compression, Security](https://medium.com/@gaankit99/serve-react-spas-with-express-caching-compression-security-logging-d2be58b54009) - HIGH confidence

### Frontend Performance
- [How to useMemo and useCallback: you can remove most of them](https://www.developerway.com/posts/how-to-use-memo-use-callback) - HIGH confidence (specifically about removing over-memoization)
- [On Overusing useCallback/useMemo in React](https://www.reddit.com/r/reactjs/comments/1mnaj2t/on_overusing_usecallbackusememo_in_react_whats/) - HIGH confidence (community discussion)
- [useMemo, useCallback, React.memo](https://dev.to/crit3cal/usememo-usecallback-reactmemo-what-optimizations-actually-work-gkp) - HIGH confidence (measurement-first approach)
- [React useMemo vs. useCallback: A pragmatic guide](https://blog.logrocket.com/react-usememo-vs-usecallback/) - HIGH confidence
- [Optimizing Lists in React - Solving Performance Problems](https://federicoterzi.com/blog/optimizing-list-in-react-solving-performance-problems-anti-patterns/) - MEDIUM confidence

### Chart Libraries
- [Comparing 8 Popular React Charting Libraries](https://medium.com/@ponshriharini/comparing-8-popular-react-charting-libraries-performance-features-and-use-cases-cc178d80b3ba) - MEDIUM confidence (2025 comparison)
- [Best React chart libraries (2025 update)](https://blog.logrocket.com/best-react-chart-libraries-2025/) - HIGH confidence (2025 review)
- [Top React Chart Libraries for 2025](https://www.updot.co/insights/best-react-chart-libraries) - MEDIUM confidence
- [D3.js vs Chart.js vs Plotly vs Recharts: Complete 2025 Comparison](https://chartomize.com/blog/d3-vs-chartjs-comparison) - HIGH confidence (includes benchmarks)
- [Top 10 React Chart Libraries for Data Visualization in 2025](https://blog.openreplay.com/react-chart-libraries-2025/) - MEDIUM confidence

### Build & DevOps
- [Serving static files in Express](https://expressjs.com/en/starter/static-files.html) - HIGH confidence (official Express docs)
- [React + Express static files best practice](https://www.reddit.com/r/learnprogramming/comments/mxm9st/react_express_static_files_best_practice/) - MEDIUM confidence (community discussion)
- [How to serve ReactJS static files with expressJS?](https://stackoverflow.com/questions/44684461/how-to-serve-reactjs-static-files-with-expressjs) - MEDIUM confidence

---

## Gaps to Address

- **Monorepo tooling decision:** Need to decide between Turborepo, Nx, or simple pnpm workspaces based on team size and complexity tolerance
- **Chart library final selection:** Need to test with actual EPUB dataset (1000+ books) to see which libraries perform adequately
- **SSE implementation details:** Need working code example of SSE progress updates with Node.js + React before implementation
- **Background job queue library choice:** Need to decide between BullMQ (Redis-based, production-ready) or simple in-memory queue for localhost-only app
- **Shared code ESM/CJS strategy:** Need to verify that both frontend (Vite ESM) and backend (Node.js ESM/CJS) can import from shared package without issues
