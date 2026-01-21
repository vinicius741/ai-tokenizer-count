# Phase 3: CLI Polish - Research

**Researched:** 2026-01-21
**Domain:** Node.js CLI user experience (progress bars, error handling, parallel processing, summary statistics)
**Confidence:** HIGH

## Summary

This phase focuses on creating a professional CLI experience with real-time progress feedback, robust dual-output error logging, parallel EPUB processing, and comprehensive summary statistics. The standard approach uses **cli-progress** for multi-progress bars (supporting parallel jobs with individual labeled bars), **p-limit** for concurrency control (appropriate for I/O-bound EPUB processing), **cli-table3** (already in dependencies) for summary table formatting, and Node.js built-in **os.cpus()** for CPU detection. Error logging should implement severity levels (FATAL/ERROR/WARN) with both console output (moderately intrusive) and persistent errors.log file entries.

**Primary recommendation:** Use cli-progress MultiBar for parallel job progress, p-limit for concurrency management, and implement severity-based error logging with dual console/file output.

## Standard Stack

The established libraries/tools for CLI polish in Node.js:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **cli-progress** | 3.12.0 | Multi-progress bars for parallel jobs | Industry standard, 2852+ dependents, built-in MultiBar support with payload tokens, ETA calculation, TTY/NOTTY modes |
| **p-limit** | 6.2.0 | Concurrency control for async operations | 3983+ dependents, pure ESM, actively maintained (3 months ago), perfect for I/O-bound tasks like EPUB processing |
| **cli-table3** | 0.6.3 | Summary statistics table formatting | Already in dependencies, API-compatible with original cli-table, Unicode table support, word wrapping |
| **commander** | 12.0.0 | CLI argument parsing (already in use) | Industry standard, already integrated, handles --jobs flag parsing |
| **os** | Built-in | CPU core detection | Node.js built-in module, os.cpus().length returns logical core count |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **ansi-colors** | Latest | Color formatting for progress bars | Optional, for styled progress bar output (not required by cli-progress) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| cli-progress | ora, multibar | cli-progress has superior MultiBar support and official logging integration during multibar operation |
| p-limit | p-queue, worker_threads | p-limit is simpler for I/O-bound tasks; p-queue adds queue management overhead; worker_threads overkill for EPUB I/O |
| cli-table3 | console.table, table | cli-table3 provides professional Unicode borders, word wrapping, better than console.table for production CLIs |
| os.cpus() | os.availableParallelism() | os.availableParallelism() is Node.js 19+ (too new), os.cpus() has broader compatibility |

**Installation:**
```bash
# New dependencies needed
npm install cli-progress p-limit

# Already installed
npm install commander cli-table3
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── cli/
│   ├── index.ts              # CLI entry point (existing)
│   └── progress.ts           # NEW: Progress bar management
├── parallel/
│   └── processor.ts          # NEW: Parallel EPUB processing with p-limit
├── errors/
│   ├── handler.ts            # Existing: Error handling
│   └── logger.ts             # NEW: Severity-based dual-output logging
├── output/
│   ├── table.ts              # Existing: Table display
│   ├── summary.ts            # NEW: Summary statistics aggregation
│   ├── json.ts               # Existing: JSON output
│   └── markdown.ts           # Existing: Markdown output
└── ...
```

### Pattern 1: Multi-Progress Bar with Parallel Jobs

**What:** Use cli-progress MultiBar to display individual progress bars for each parallel EPUB processing job, with dynamic bar creation/removal as jobs start/complete.

**When to use:** Processing multiple EPUB files in parallel (controlled by --jobs flag).

**Example:**
```typescript
// Source: https://github.com/npkgz/cli-progress (verified official docs)
import cliProgress from 'cli-progress';
import pLimit from 'p-limit';
import os from 'os';

// CPU-aware default: (CPU count - 1) or 1
const defaultJobs = Math.max(1, os.cpus().length - 1);

// Create concurrency limiter
const limit = pLimit(defaultJobs);

// Create MultiBar container for parallel progress display
const multibar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: ' {bar} | {filename} | {value}/{total} | {percentage}%',
  fps: 10,
  stream: process.stdout
}, cliProgress.Presets.shades_grey);

// Process EPUBs with concurrency control and progress tracking
const files = ['book1.epub', 'book2.epub', 'book3.epub'];
const tasks = files.map(file => {
  return limit(async () => {
    // Create individual bar for this job
    const bar = multibar.create(100, 0, { filename: file });

    try {
      // Process file with progress updates
      await processFile(file, (progress) => {
        bar.update(progress);
      });
      bar.update(100); // Complete
    } finally {
      // Remove bar after completion (optional)
      // multibar.remove(bar);
    }
  });
});

await Promise.all(tasks);
multibar.stop(); // Stop all bars
```

### Pattern 2: Severity-Based Error Logging with Dual Output

**What:** Implement error logging with severity levels (FATAL/ERROR/WARN) that outputs to both console (moderately intrusive) and errors.log file (persistent).

**When to use:** Any error during EPUB processing, with different behaviors based on severity.

**Example:**
```typescript
// Source: Best practices from https://blog.appsignal.com/2021/09/01/best-practices-for-logging-in-nodejs.html
// Severity levels based on Syslog standard (https://stackoverflow.com/questions/2031163/when-to-use-the-different-log-levels)

export enum ErrorSeverity {
  FATAL = 'FATAL',   // Catastrophic, cannot continue (e.g., missing dependencies)
  ERROR = 'ERROR',   // File skipped but processing continues (e.g., corrupted EPUB)
  WARN = 'WARN'      // Partial results, processing succeeds (e.g., metadata missing)
}

export interface ErrorLogEntry {
  timestamp: string;      // ISO 8601
  severity: ErrorSeverity;
  file: string;
  error: string;
  suggestion?: string;
}

export async function logError(entry: ErrorLogEntry, outputDir: string): Promise<void> {
  // Console output (moderately intrusive - visible but auto-resumes)
  const consoleMsg = `[${entry.severity}] ${entry.file}: ${entry.error}`;
  if (entry.severity === ErrorSeverity.FATAL) {
    console.error(consoleMsg);
    if (entry.suggestion) console.error(`  Suggestion: ${entry.suggestion}`);
  } else if (entry.severity === ErrorSeverity.ERROR) {
    console.error(consoleMsg);
    // Brief pause for visibility
    await new Promise(resolve => setTimeout(resolve, 500));
  } else {
    console.warn(consoleMsg);
  }

  // File output (persistent)
  const logPath = path.join(outputDir, 'errors.log');
  const logLine = `[${entry.timestamp}] [${entry.severity}] ${entry.file}: ${entry.error}${entry.suggestion ? ` Suggestion: ${entry.suggestion}` : ''}\n`;
  await fs.appendFile(logPath, logLine);
}
```

### Pattern 3: CPU-Aware Parallel Processing

**What:** Auto-detect CPU cores using os.cpus() and default to (CPU count - 1) parallel jobs, with --jobs flag accepting number or "all" keyword.

**When to use:** Default behavior for parallel EPUB processing; user override via --jobs flag.

**Example:**
```typescript
// Source: https://nodejs.org/api/os.html (official docs)
import os from 'os';

function getJobCount(jobsFlag?: string): number {
  const cpuCount = os.cpus().length;

  if (!jobsFlag) {
    // Default: CPU count - 1 (leave one core for system)
    return Math.max(1, cpuCount - 1);
  }

  if (jobsFlag === 'all') {
    return cpuCount;
  }

  const parsed = parseInt(jobsFlag, 10);
  if (isNaN(parsed) || parsed <= 0) {
    console.error(`Error: --jobs must be a positive number or "all", got "${jobsFlag}"`);
    process.exit(1);
  }

  // Warn if >32 jobs (diminishing returns)
  if (parsed > 32) {
    console.warn(`Warning: --jobs=${parsed} is unusually high. Consider using "all" (${cpuCount} cores) or a lower value.`);
  }

  return parsed;
}
```

### Anti-Patterns to Avoid

- **Anti-pattern:** Using worker_threads for EPUB processing
  - **Why it's bad:** EPUB processing is I/O-bound (file reading, parsing), not CPU-bound. Worker threads add overhead without benefit.
  - **What to do instead:** Use p-limit for concurrency control of async I/O operations.

- **Anti-pattern:** Creating all progress bars upfront for all files
  - **Why it's bad:** Clutters terminal with inactive bars; poor UX for large batches.
  - **What to do instead:** Create bars dynamically as jobs start (using MultiBar.create() within each job).

- **Anti-pattern:** Using console.log() for errors without severity levels
  - **Why it's bad:** All errors look the same; users can't distinguish fatal from recoverable.
  - **What to do instead:** Use severity-based logging (FATAL stops processing, ERROR continues with visible pause, WARN is informational).

- **Anti-pattern:** Not handling os.cpus() edge cases
  - **Why it's bad:** In some environments (containers, restricted systems), os.cpus() may return undefined or empty array.
  - **What to do instead:** Always provide fallback: `const cpuCount = os.cpus()?.length || 1;`

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-progress bars for parallel jobs | Custom terminal cursor control, ANSI escape codes | cli-progress MultiBar | Terminal TTY detection, cursor hide/restore, FPS limiting, ETA calculation, graceful SIGINT handling already built-in |
| Concurrency control | Manual Promise.all batching, semaphores | p-limit | Queue management, activeCount/pendingCount introspection, tested edge cases |
| Summary table formatting | Manual string padding, border characters | cli-table3 | Unicode borders, text wrapping, column alignment, word breaking |
| CPU detection | /proc/cpuinfo parsing, sysinfo calls | os.cpus().length | Cross-platform (Linux/macOS/Windows), built-in, maintained |

**Key insight:** CLI polish libraries handle terminal edge cases (TTY vs non-TTY, cursor management, signal handling) that are easy to get wrong in custom implementations.

## Common Pitfalls

### Pitfall 1: Progress Bar Output Contamination

**What goes wrong:** Using console.log() or console.error() during MultiBar operation causes output to be overwritten by progress bar redraws, making messages invisible or garbled.

**Why it happens:** MultiBar uses terminal cursor manipulation to redraw progress bars; other writes interfere with cursor positioning.

**How to avoid:** Use MultiBar.log() method for logging during multibar operation (requires newline at end).

**Warning signs:** Messages appear briefly then disappear, or progress bars get corrupted/misaligned.

```typescript
// WRONG - contaminates multibar output
console.error('Error processing file');

// RIGHT - logs above multibar
multibar.log('Error processing file\n');
```

### Pitfall 2: Memory Issues with High Parallelism

**What goes wrong:** Setting --jobs too high (e.g., 100) causes out-of-memory errors when processing large EPUBs in parallel.

**Why it happens:** Each parallel job loads an EPUB into memory; with N jobs, memory usage is N×EPUB_size. Node.js default heap is ~2GB.

**How to avoid:** Warn on high job counts (>32), consider per-job memory limits or global --max-mb enforcement.

**Warning signs:** Process crashes with "JavaScript heap out of memory" or becomes unresponsive.

**Memory calculation:** If processing 100MB EPUBs with 10 parallel jobs, peak memory is ~1GB. With 50 jobs, ~5GB (likely exceeds default heap).

### Pitfall 3: os.cpus() Returning Undefined/Empty

**What goes wrong:** In restricted environments (Docker containers, some CI systems), os.cpus() may return undefined or empty array, causing Math.max(1, undefined - 1) to fail.

**Why it happens:** Some container runtimes restrict CPU information for isolation.

**How to avoid:** Always provide fallback: `const cpuCount = os.cpus()?.length || 1;`

**Warning signs:** "Cannot read property 'length' of undefined" or NaN in job count.

### Pitfall 4: Progress Bars Not Updating in Real-Time

**What goes wrong:** Progress bars jump from 0% to 100% without intermediate updates, or updates are delayed.

**Why it happens:** cli-progress has FPS limiter (default 10). If progress updates happen faster than FPS limit, some updates are skipped. Or, async operations don't yield to event loop frequently enough.

**How to avoid:** Increase FPS limit if needed (e.g., `fps: 30`), or ensure async operations await periodically.

**Warning signs:** Progress bars appear "frozen" then suddenly complete.

### Pitfall 5: Error Log File Permission Errors

**What goes wrong:** Error logging fails silently when output directory doesn't exist or is not writable.

**Why it happens:** fs.appendFile() doesn't create parent directories; errors during logging are often swallowed.

**How to avoid:** Always ensure output directory exists before logging, catch logging errors and fall back to console.error().

**Warning signs:** errors.log file is empty despite errors occurring.

```typescript
try {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.appendFile(logPath, logLine);
} catch (error) {
  // Fallback to console if file logging fails
  console.error(`Failed to write to errors.log: ${error}`);
}
```

## Code Examples

Verified patterns from official sources:

### Multi-Progress Bar with Dynamic Creation

```typescript
// Source: https://github.com/npkgz/cli-progress (verified official docs)
import cliProgress from 'cli-progress';

const multibar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: ' {bar} | {filename} | {value}/{total} | {percentage}%',
  fps: 10
}, cliProgress.Presets.shades_grey);

// Dynamically create bars as jobs start
async function processFileWithProgress(filename: string) {
  const bar = multibar.create(100, 0, { filename });

  try {
    for (let i = 0; i <= 100; i += 10) {
      bar.update(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } finally {
    // Bar completes at 100, removed on multibar.stop()
  }
}

const files = ['file1.epub', 'file2.epub', 'file3.epub'];
await Promise.all(files.map(processFileWithProgress));

multibar.stop(); // Stop all bars and restore cursor
```

### Concurrency Control with p-limit

```typescript
// Source: https://www.npmjs.com/package/p-limit (verified official docs)
import pLimit from 'p-limit';

const limit = pLimit(2); // Max 2 concurrent operations

const inputs = [
  limit(() => fetchSomething('1')),
  limit(() => fetchSomething('2')),
  limit(() => fetchSomething('3')),
  limit(() => fetchSomething('4')),
];

const result = await Promise.all(inputs);
// Only 2 operations run at a time
```

### CLI-Table3 Summary Statistics

```typescript
// Source: https://github.com/Automattic/cli-table (verified - cli-table3 is API-compatible)
import Table from 'cli-table3';

const table = new Table({
  head: ['Metric', 'Value'],
  colWidths: [30, 20]
});

table.push(
  ['Total EPUBs processed', '42'],
  ['Successful', '40'],
  ['Failed', '2'],
  ['Total words', '1,234,567'],
  ['Average words/EPUB', '29,395']
);

console.log(table.toString());
```

### CPU Detection with Fallback

```typescript
// Source: https://nodejs.org/api/os.html (official docs)
import os from 'os';

function getCpuCount(): number {
  const cpus = os.cpus();
  if (!cpus || cpus.length === 0) {
    console.warn('Warning: Could not detect CPU count, defaulting to 1');
    return 1;
  }
  return cpus.length;
}

const cpuCount = getCpuCount();
const defaultJobs = Math.max(1, cpuCount - 1);
console.log(`Detected ${cpuCount} CPU cores, using ${defaultJobs} parallel jobs`);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single progress bar for batch | Multi-progress bars (one per parallel job) | ~2019+ (cli-progress v2+) | Better visibility into per-file progress, essential for parallel processing UX |
| Sequential file processing | Parallel processing with p-limit | ~2020+ (p-limit v3+) | Significant speedup for I/O-bound batch processing (2-10x faster depending on core count) |
| Console-only error output | Dual output (console + errors.log) | Industry best practice | Persistent error history for debugging, better UX with visible console feedback |
| Manual CPU count | os.cpus().length with fallback | Node.js v0.3+ (2009) | Cross-platform CPU detection, critical for intelligent parallelism defaults |

**Deprecated/outdated:**

- **ora spinner for parallel jobs:** ora is designed for single-task spinners, not multi-job progress. Use cli-progress MultiBar instead.
- **console.table() for production CLIs:** Limited formatting options, no word wrapping, poor Unicode support. Use cli-table3.
- **Manual concurrency with Promise.all batching:** Error-prone, no queue management. Use p-limit.
- **os.availableParallelism():** Too new (Node.js 19.4+, 2023), not widely supported. Use os.cpus() for compatibility.

## Open Questions

1. **Progress bar row allocation for parallel jobs**
   - What we know: cli-progress MultiBar supports dynamic bar creation/removal
   - What's unclear: Whether to allocate one row per job (active bars) vs use row recycling (bars appear/disappear)
   - Recommendation: Dynamic creation (bar appears when job starts, completes at 100, stays visible until multibar.stop()) - provides complete history, better UX for "what happened"

2. **Overall summary bar alongside individual bars**
   - What we know: MultiBar supports multiple bars simultaneously
   - What's unclear: Whether to add an overall "X of Y files processed" bar alongside individual file bars
   - Recommendation: Skip overall bar - individual bars provide sufficient progress feedback, overall bar adds noise/complexity

3. **Memory protection strategy for parallel processing**
   - What we know: Each parallel job loads EPUB into memory; --max-mb limits individual EPUB size
   - What's unclear: Whether to enforce per-job memory limits (hard) or rely on job count as sole control (simple)
   - Recommendation: Job count as primary control (--jobs flag), warn on high values (>32), document that users should reduce --jobs if OOM occurs

4. **Summary visual structure**
   - What we know: cli-table3 supports horizontal, vertical, and cross tables
   - What's unclear: Whether to use single comprehensive table vs sectioned blocks (overview, failures, tokenizer stats)
   - Recommendation: Sectioned blocks - clearer separation of concerns, easier to scan, failures don't get lost in large tables

## Sources

### Primary (HIGH confidence)

- **cli-progress GitHub** - Multi-progress bar patterns, API documentation, examples
  - https://github.com/npkgz/cli-progress
- **cli-progress npm** - Package features, version 3.12.0, 2852+ dependents
  - https://www.npmjs.com/package/cli-progress
- **p-limit npm** - Concurrency control API, version 6.2.0, 3983+ dependents
  - https://www.npmjs.com/package/p-limit
- **cli-table GitHub** - Table formatting API (cli-table3 is API-compatible)
  - https://github.com/Automattic/cli-table
- **Node.js os module documentation** - CPU detection with os.cpus()
  - https://nodejs.org/api/os.html
- **Speed Up Data Processing in Node with p-limit** (Solita, Nov 2025) - p-limit vs worker_threads comparison
  - https://dev.solita.fi/2025/11/18/speed-up-node-data-processing.html
- **How to work with logging and progress bar** (StackOverflow) - MultiBar.log() integration
  - https://stackoverflow.com/questions/71898650/how-to-work-with-logging-and-progress-bar-in-a-node-js-cli-application

### Secondary (MEDIUM confidence)

- **Best Practices for Node.js Logging** (AppSignal, 2021) - Log severity levels (FATAL/ERROR/WARN)
  - https://blog.appsignal.com/2021/09/01/best-practices-for-logging-in-nodejs.html
- **When to use different log levels** (StackOverflow) - Syslog standard severity hierarchy
  - https://stackoverflow.com/questions/2031163/when-to-use-the-different-log-levels
- **Best Practices for Node.js Logging** (ForwardEmail, 2026) - Modern logging practices
  - https://forwardemail.net/en/blog/docs/best-practices-for-node-logging
- **CLI UX Best Practices** (Evil Martians, Apr 2024) - Progress display patterns
  - https://evilmartians.com/chronicles/cli-ux-best-practices-3-patterns-for-improving-progress-displays
- **Node.js Memory Documentation** - Official memory management guidance
  - https://nodejs.org/en/learn/diagnostics/memory

### Tertiary (LOW confidence - marked for validation)

- **Top 25 Node.js Libraries in 2026** (MindPathTech) - General ecosystem overview
  - https://www.mindpathtech.com/blog/nodejs-libraries/
- **Introduction to memory management in Node.js** (Daily.co, 2023) - Memory basics
  - https://www.daily.co/blog/introduction-to-memory-management-in-node-js-applications/
- **cli-table3 Guide** (Generalist Programmer, Nov 2025) - cli-table3 tutorial
  - https://generalistprogrammer.com/tutorials/cli-table3-npm-package-guide

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs (cli-progress, p-limit, cli-table3, os module)
- Architecture: HIGH - Patterns verified via official GitHub repositories and npm documentation
- Pitfalls: MEDIUM - Based on documented edge cases in official docs and common CLI issues from StackOverflow
- Memory considerations: MEDIUM - Based on Node.js memory docs and Solita blog comparison (recent, authoritative)

**Research date:** 2026-01-21
**Valid until:** 30 days (stable ecosystem - CLI libraries are mature, unlikely to change rapidly)

**Prior decisions from CONTEXT.md:**
- Progress: Multi-progress bars, format "filename.epub: 45%", row allocation at Claude's discretion
- Error experience: Dual output (console + errors.log), severity levels (FATAL/ERROR/WARN), moderately intrusive with auto-resume
- Parallel processing: Auto-detect CPU cores, default to (CPU count - 1), --jobs flag accepts number or "all", warn if >32
- Summary: Core + averages (total EPUBs, total words, total tokens per tokenizer, failures, averages), structure at Claude's discretion
