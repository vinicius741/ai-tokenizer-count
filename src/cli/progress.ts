/**
 * Progress Bar Management Module
 *
 * Provides progress bar functionality using cli-progress MultiBar.
 * Supports dynamic bar creation for parallel processing workflows.
 *
 * Usage:
 *   const multibar = createProgressBars();
 *   const bar = createBar(multibar, 'book.epub', 100);
 *   updateProgress(bar, 50);
 *   stopAll(multibar);
 */

import cliProgress from 'cli-progress';

/**
 * Create and configure a MultiBar instance for progress tracking
 *
 * MultiBar supports multiple simultaneous progress bars, essential
 * for parallel processing workflows. Configuration includes:
 * - Custom format with filename and progress indicators
 * - Cursor hiding for clean terminal output
 * - Bars persist on completion (clearOnComplete: false)
 *
 * @returns Configured MultiBar instance
 */
export function createProgressBars(): cliProgress.MultiBar {
  return new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {filename} | {value}/{total}',
    fps: 10,
    stream: process.stdout
  }, cliProgress.Presets.shades_grey);
}

/**
 * Create an individual progress bar for a single file
 *
 * Bars are created dynamically as processing starts, not upfront.
 * This is critical for parallel processing where jobs start at
 * different times.
 *
 * @param multiBar - MultiBar instance from createProgressBars()
 * @param filename - Display name for the progress bar
 * @param total - Maximum value (default: 100 for percentage)
 * @returns Progress bar instance
 */
export function createBar(
  multiBar: cliProgress.MultiBar,
  filename: string,
  total: number = 100
): cliProgress.Bar {
  return multiBar.create(total, 0, { filename });
}

/**
 * Update progress bar to current value
 *
 * @param bar - Progress bar instance from createBar()
 * @param current - Current progress value
 */
export function updateProgress(bar: cliProgress.Bar, current: number): void {
  bar.update(current);
}

/**
 * Stop all progress bars and restore terminal cursor
 *
 * Call this after all processing is complete to clean up
 * the terminal state.
 *
 * @param multiBar - MultiBar instance from createProgressBars()
 */
export function stopAll(multiBar: cliProgress.MultiBar): void {
  multiBar.stop();
}
