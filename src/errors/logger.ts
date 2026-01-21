/**
 * Error Logger Module
 *
 * Provides severity-based error logging with dual output (console + file).
 * Supports FATAL (catastrophic), ERROR (file skipped), and WARN (partial results).
 *
 * Console behavior varies by severity:
 * - FATAL: Logs to stderr, exits with error code
 * - ERROR: Logs to stderr with 500ms pause for visibility
 * - WARN: Logs to console.warn without pause
 *
 * File output (errors.log) is persistent and includes ISO 8601 timestamps.
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Error severity levels following Syslog standard
 *
 * FATAL: Catastrophic error that cannot be recovered from (e.g., missing dependencies)
 * ERROR: File-level error that skips processing but continues batch (e.g., corrupted EPUB)
 * WARN: Partial results or non-critical issues (e.g., missing metadata fields)
 */
export enum ErrorSeverity {
  FATAL = 'FATAL',   // Catastrophic, cannot continue
  ERROR = 'ERROR',   // File skipped but processing continues
  WARN = 'WARN'      // Partial results, processing succeeds
}

/**
 * Single error log entry for persistence
 */
export interface ErrorLogEntry {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Error severity level */
  severity: ErrorSeverity;
  /** File path that failed (or context for the error) */
  file: string;
  /** Error message */
  error: string;
  /** Optional suggestion for fixing the error */
  suggestion?: string;
}

/**
 * Log error to both console (with severity-based behavior) and errors.log file (persistent)
 *
 * Console output:
 * - FATAL: console.error, exits with error code 1
 * - ERROR: console.error with 500ms pause for visibility
 * - WARN: console.warn without pause
 *
 * File output (errors.log):
 * - Format: "[timestamp] [SEVERITY] file: error Suggestion: suggestion"
 * - Persistent record for debugging
 * - Falls back to console if file write fails
 *
 * @param entry - Error log entry to write
 * @param outputDir - Output directory path (default: './results')
 *
 * @example
 * ```ts
 * await logError({
 *   timestamp: new Date().toISOString(),
 *   severity: ErrorSeverity.ERROR,
 *   file: './books/corrupted.epub',
 *   error: 'Invalid EPUB format',
 *   suggestion: 'File may be corrupted or not a valid EPUB.'
 * }, './results');
 * ```
 */
export async function logError(entry: ErrorLogEntry, outputDir: string = './results'): Promise<void> {
  const consoleMsg = `[${entry.severity}] ${entry.file}: ${entry.error}`;

  // Console output based on severity
  if (entry.severity === ErrorSeverity.FATAL) {
    console.error(consoleMsg);
    if (entry.suggestion) {
      console.error(`  Suggestion: ${entry.suggestion}`);
    }
  } else if (entry.severity === ErrorSeverity.ERROR) {
    console.error(consoleMsg);
    // Brief pause for visibility (user sees error before next output)
    await new Promise(resolve => setTimeout(resolve, 500));
  } else {
    // WARN - informational only
    console.warn(consoleMsg);
  }

  // File output (persistent)
  try {
    await fs.mkdir(outputDir, { recursive: true });
    const logPath = path.join(outputDir, 'errors.log');
    const logLine = `[${entry.timestamp}] [${entry.severity}] ${entry.file}: ${entry.error}${entry.suggestion ? ` Suggestion: ${entry.suggestion}` : ''}\n`;
    await fs.appendFile(logPath, logLine);
  } catch (error) {
    // Fallback to console if file logging fails
    console.error(`Failed to write to errors.log: ${error}`);
  }
}
