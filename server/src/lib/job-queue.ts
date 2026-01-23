/**
 * In-Memory Job Queue for Background EPUB Processing
 *
 * Provides a sequential job queue for EPUB processing with status tracking
 * and progress callbacks for SSE integration. Jobs are processed one at a time
 * to avoid overwhelming the system with concurrent tokenization operations.
 *
 * @module lib/job-queue
 */

import path from 'path';
import type {
  JobStatus,
  JobState,
  EpubProgress,
  ResultsOutput,
  ProcessRequest,
} from '@epub-counter/shared';

// Dynamic imports to avoid TypeScript rootDir issues
// CLI code is built separately, we import at runtime
async function importCliModules() {
  const cliPath = path.resolve(process.cwd(), 'dist');
  return {
    discoverEpubFiles: (await import(path.join(cliPath, 'file-discovery/scanner.js'))).discoverEpubFiles,
    processEpubsWithErrors: (await import(path.join(cliPath, 'errors/handler.js'))).processEpubsWithErrors,
    writeJsonFile: (await import(path.join(cliPath, 'output/json.js'))).writeJsonFile,
  };
}

/**
 * Processing job internal representation
 *
 * Extends JobState with internal fields for queue management.
 */
interface ProcessingJob extends Omit<JobState, 'jobId'> {
  /** Unique job identifier */
  id: string;
  /** Processing request parameters */
  request: ProcessRequest;
  /** Optional promise resolver for job completion */
  resolve?: (value: JobState) => void;
  /** Optional progress callback for SSE updates */
  onProgress?: (progress: EpubProgress) => void;
  /** Flag to cancel processing */
  cancelled?: boolean;
}

/**
 * In-Memory Job Queue Class
 *
 * Manages EPUB processing jobs with FIFO queue and sequential processing.
 * Provides job status tracking, cancellation support, and progress callbacks.
 */
export class JobQueue {
  /** In-memory job storage keyed by job ID */
  private jobs: Map<string, ProcessingJob> = new Map();

  /** FIFO queue of job IDs */
  private queue: string[] = [];

  /** Currently processing job ID */
  private currentJob: string | null = null;

  /** Whether processor is running */
  private isProcessing = false;

  /**
   * Generate a unique job ID
   *
   * Format: job-{timestamp}-{random}
   * @returns Unique job identifier
   */
  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Create a new processing job
   *
   * @param request - Processing request parameters
   * @returns Processing job object
   */
  private createJob(request: ProcessRequest): ProcessingJob {
    const now = new Date().toISOString();
    return {
      id: this.generateJobId(),
      status: 'queued' as JobStatus,
      createdAt: now,
      request,
    };
  }

  /**
   * Enqueue a new EPUB processing job
   *
   * Creates a job, adds it to the queue, and starts processing if not already running.
   *
   * @param request - Processing request parameters
   * @returns Job ID for status tracking
   *
   * @example
   * ```ts
   * const jobId = jobQueue.enqueue({
   *   path: './epubs',
   *   tokenizers: ['gpt4', 'claude'],
   *   recursive: true,
   *   maxMb: 500
   * });
   * ```
   */
  enqueue(request: ProcessRequest): string {
    const job = this.createJob(request);
    this.jobs.set(job.id, job);
    this.queue.push(job.id);

    // Start processing loop if not running
    if (!this.isProcessing) {
      this.processNext().catch((error) => {
        console.error('Error in job queue processing:', error);
      });
    }

    return job.id;
  }

  /**
   * Process next job in queue
   *
   * Sequentially processes jobs from the queue. For each job:
   * 1. Discovers EPUB files
   * 2. Processes each EPUB with progress updates
   * 3. Generates output files
   * 4. Updates job status
   *
   * Errors during processing mark the job as failed but don't stop the queue.
   */
  private async processNext(): Promise<void> {
    // Import CLI modules at runtime
    const { discoverEpubFiles, processEpubsWithErrors, writeJsonFile } = await importCliModules();
    // If queue is empty, stop processing
    if (this.queue.length === 0) {
      this.isProcessing = false;
      this.currentJob = null;
      return;
    }

    this.isProcessing = true;

    // Dequeue next job
    const jobId = this.queue.shift()!;
    this.currentJob = jobId;
    const job = this.jobs.get(jobId)!;

    // Update job status to processing
    job.status = 'processing' as JobStatus;

    try {
      // Discover EPUB files
      const epubFiles = await discoverEpubFiles(job.request.path, {
        recursive: job.request.recursive ?? false,
        includeHidden: false,
      });

      if (epubFiles.length === 0) {
        job.status = 'completed' as JobStatus;
        job.completedAt = new Date().toISOString();
        job.results = {
          schemaVersion: '1.0',
          timestamp: new Date().toISOString(),
          options: {
            tokenizers: job.request.tokenizers,
            maxMb: job.request.maxMb ?? 500,
          },
          results: [],
          summary: { total: 0, success: 0, failed: 0 },
        };
        this.currentJob = null;
        this.processNext();
        return;
      }

      // Process EPUBs with progress tracking
      const total = epubFiles.length;
      let current = 0;

      // Process files sequentially (one at a time)
      const result: any = {
        successful: [],
        failed: [],
        total,
        tokenCounts: new Map(),
      };

      for (const file of epubFiles) {
        // Check for cancellation
        if (job.cancelled) {
          job.status = 'cancelled' as JobStatus;
          job.completedAt = new Date().toISOString();
          this.currentJob = null;
          this.processNext();
          return;
        }

        current++;
        const fileName = path.basename(file);

        // Update progress
        const progress: EpubProgress = {
          fileName,
          current,
          total,
          percent: Math.round((current / total) * 100),
        };
        job.progress = progress;

        // Call progress callback if registered
        if (job.onProgress) {
          job.onProgress(progress);
        }

        // Process single file
        try {
          const fileResult = await processEpubsWithErrors(
            [file],
            false,
            './results',
            job.request.tokenizers,
            job.request.maxMb ?? 500
          );

          result.successful.push(...fileResult.successful);
          result.failed.push(...fileResult.failed);
          for (const [key, value] of fileResult.tokenCounts) {
            result.tokenCounts.set(key, value);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.failed.push({
            file,
            error: errorMessage,
          });
          progress.error = errorMessage;
        }
      }

      // Write JSON output file
      const jsonPath = await writeJsonFile(result, { outputDir: './results' }, result.tokenCounts);

      // Mark job as completed
      job.status = 'completed' as JobStatus;
      job.completedAt = new Date().toISOString();
      job.progress = undefined;
      job.results = {
        schemaVersion: '1.0',
        timestamp: new Date().toISOString(),
        options: {
          tokenizers: job.request.tokenizers,
          maxMb: job.request.maxMb ?? 500,
        },
        results: result.successful.map((epub: any) => ({
          filePath: epub.file_path,
          metadata: {
            title: epub.title,
            author: epub.author,
            language: epub.language,
            publisher: epub.publisher,
          },
          wordCount: epub.wordCount,
          tokenCounts: result.tokenCounts.get(epub.filename) || [],
        })),
        summary: {
          total: result.total,
          success: result.successful.length,
          failed: result.failed.length,
        },
      };

      // Resolve promise if registered
      if (job.resolve) {
        job.resolve(this.getJobState(job.id)!);
      }
    } catch (error) {
      // Mark job as failed
      job.status = 'failed' as JobStatus;
      job.completedAt = new Date().toISOString();
      job.progress = undefined;
      job.error = error instanceof Error ? error.message : String(error);

      // Resolve promise with failed state
      if (job.resolve) {
        job.resolve(this.getJobState(job.id)!);
      }
    }

    this.currentJob = null;
    this.processNext();
  }

  /**
   * Get job state by ID
   *
   * Returns a shallow copy of the job state with jobId and progress/results.
   *
   * @param jobId - Job identifier
   * @returns Job state or null if not found
   */
  getStatus(jobId: string): JobState | null {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }

    return {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      results: job.results,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  }

  /**
   * Get internal job state (includes private fields)
   *
   * @param jobId - Job identifier
   * @returns Processing job or null if not found
   */
  private getJobState(jobId: string): JobState | null {
    return this.getStatus(jobId);
  }

  /**
   * Cancel a job
   *
   * If the job is queued, it's removed from the queue.
   * If the job is processing, cancellation happens after the current EPUB.
   * If the job is completed/failed/cancelled, returns the current status.
   *
   * @param jobId - Job identifier
   * @returns Updated job state or null if not found
   */
  cancel(jobId: string): JobState | null {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }

    // If queued, remove from queue
    const queueIndex = this.queue.indexOf(jobId);
    if (queueIndex !== -1) {
      this.queue.splice(queueIndex, 1);
      job.status = 'cancelled' as JobStatus;
      job.completedAt = new Date().toISOString();
      return this.getStatus(jobId);
    }

    // If processing, set flag to cancel after current EPUB
    if (this.currentJob === jobId) {
      job.cancelled = true;
      return this.getStatus(jobId);
    }

    // Already completed/failed/cancelled
    return this.getStatus(jobId);
  }

  /**
   * Set progress callback for a job
   *
   * Registers a callback function that receives progress updates during processing.
   *
   * @param jobId - Job identifier
   * @param callback - Progress callback function
   * @returns true if callback was registered, false if job not found
   *
   * @example
   * ```ts
   * jobQueue.setProgressCallback(jobId, (progress) => {
   *   console.log(`Processing ${progress.fileName}: ${progress.percent}%`);
   * });
   * ```
   */
  setProgressCallback(jobId: string, callback: (progress: EpubProgress) => void): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }
    job.onProgress = callback;
    return true;
  }
}

/**
 * Singleton instance for the server
 *
 * All routes share the same queue instance for consistent job management.
 */
export const jobQueue = new JobQueue();
