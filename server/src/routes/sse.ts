/**
 * Server-Sent Events (SSE) Endpoint
 *
 * Provides real-time progress updates for EPUB processing jobs.
 * Clients connect to /api/sse/:jobId to receive a stream of events
 * including queued status, progress updates, completion, and errors.
 *
 * @module routes/sse
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type {
  JobStatus,
  JobState,
  EpubProgress,
  ResultsOutput,
} from '@epub-counter/shared';
import { jobQueue } from '../lib/job-queue.js';

/**
 * SSE route parameters
 */
interface SseParams {
  jobId: string;
}

/**
 * SSE event data types
 */
interface QueuedEventData {
  status: 'queued';
  position: number;
}

interface ErrorEventData {
  code: string;
  message: string;
}

type SseEventData = EpubProgress | ResultsOutput | QueuedEventData | ErrorEventData;

/**
 * Send SSE event to client
 *
 * Writes raw SSE format to the response stream.
 * Format: "event: {type}\ndata: {json}\n\n"
 *
 * @param reply - Fastify reply object
 * @param event - Event type (progress, completed, error, queued)
 * @param data - Event data to send
 */
function sendSseEvent(
  reply: FastifyReply,
  event: string,
  data: SseEventData
): void {
  const rawData = JSON.stringify(data);
  reply.raw.write(`event: ${event}\ndata: ${rawData}\n\n`);
}

/**
 * SSE handler for job progress streaming
 *
 * Registers GET /api/sse/:jobId route that streams SSE events.
 * Handles all job states (queued, processing, completed, failed, cancelled).
 *
 * @param fastify - Fastify instance
 */
export async function sseHandler(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/sse/:jobId', async (request: FastifyRequest<{ Params: SseParams }>, reply: FastifyReply) => {
    const { jobId } = request.params;

    // Check if job exists
    const jobState = jobQueue.getStatus(jobId);
    if (!jobState) {
      return reply.status(404).send({
        success: false,
        error: `Job not found: ${jobId}`,
      });
    }

    // Set SSE headers
    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send headers immediately
    reply.raw.writeHead(200);

    // Handle based on current job status
    const { status } = jobState;

    switch (status) {
      case 'queued': {
        // Send queued event with position
        const position = jobQueue.getQueuePosition(jobId);
        sendSseEvent(reply, 'queued', {
          status: 'queued',
          position,
        });
        break;
      }

      case 'processing': {
        // Send current progress if available
        if (jobState.progress) {
          sendSseEvent(reply, 'progress', jobState.progress);
        }

        // Register progress callback for streaming updates
        jobQueue.setProgressCallback(jobId, (progress: EpubProgress) => {
          try {
            sendSseEvent(reply, 'progress', progress);
          } catch (err) {
            // Client disconnected, stop trying to send
            fastify.log.warn(`Failed to send progress for job ${jobId}:`, err);
          }
        });
        break;
      }

      case 'completed': {
        // Send final results
        if (jobState.results) {
          sendSseEvent(reply, 'completed', jobState.results);
        }
        break;
      }

      case 'failed': {
        // Send error event
        sendSseEvent(reply, 'error', {
          code: 'JOB_FAILED',
          message: jobState.error || 'Job failed without error message',
        });
        break;
      }

      case 'cancelled': {
        // Send cancellation event
        sendSseEvent(reply, 'error', {
          code: 'JOB_CANCELLED',
          message: 'Job was cancelled',
        });
        break;
      }
    }

    // Listen for client disconnect to clean up progress callback
    request.raw.on('close', () => {
      jobQueue.removeProgressCallback(jobId);
      fastify.log.debug(`SSE client disconnected for job ${jobId}`);
    });

    // Keep connection open
    // Note: For SSE, we don't call reply.send() - the connection stays open
    // The client will disconnect when they're done or the server closes the connection
  });
}
