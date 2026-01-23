/**
 * Job Status Query Route
 *
 * Provides GET /api/jobs/:jobId endpoint for querying job status after
 * SSE disconnect. Allows users to retrieve job results and status
 * information at any time.
 *
 * @module routes/job-status
 */

import type { FastifyInstance } from 'fastify';
import type { JobState } from '@epub-counter/shared';
import { jobQueue } from '../lib/job-queue.js';

/**
 * API error response format
 */
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Job status route handler
 *
 * Registers GET /api/jobs/:jobId endpoint that returns the current
 * state of a processing job. Supports querying completed jobs to
 * retrieve results after SSE disconnect.
 *
 * @param fastify - Fastify instance
 * @returns Promise that resolves when routes are registered
 *
 * @example
 * ```ts
 * await fastify.register(jobStatusHandler)
 * ```
 */
export async function jobStatusHandler(fastify: FastifyInstance): Promise<void> {
  // GET /api/jobs/:jobId - Query job status
  fastify.get<{
    Params: { jobId: string };
  }>(
    '/api/jobs/:jobId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            jobId: { type: 'string', description: 'Job identifier' },
          },
          required: ['jobId'],
        },
        response: {
          200: {
            description: 'Job state',
            type: 'object',
            properties: {
              jobId: { type: 'string' },
              status: { type: 'string', enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'] },
              createdAt: { type: 'string' },
              completedAt: { type: 'string' },
              progress: {
                type: 'object',
                properties: {
                  fileName: { type: 'string' },
                  current: { type: 'number' },
                  total: { type: 'number' },
                  percent: { type: 'number' },
                  error: { type: 'string' },
                },
              },
              results: { type: 'object' },
              error: { type: 'string' },
            },
          },
          404: {
            description: 'Job not found',
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { jobId } = request.params;

      // Get job state from queue
      const jobState = jobQueue.getStatus(jobId);

      // Return 404 if job not found
      if (!jobState) {
        const errorResponse: ApiErrorResponse = {
          error: {
            code: 'JOB_NOT_FOUND',
            message: 'Job not found',
          },
        };
        return reply.status(404).send(errorResponse);
      }

      // Return job state
      return reply.status(200).send(jobState);
    }
  );

  // GET /api/jobs - List all jobs (optional endpoint)
  fastify.get('/api/jobs', async (_request, reply) => {
    // This endpoint is a convenience for listing all jobs
    // Note: JobQueue doesn't expose a getAllJobs method, so we'd need to add one
    // For now, returning an empty array to avoid breaking changes
    return reply.status(200).send({
      jobs: [],
      message: 'Job listing not implemented. Use /api/jobs/:jobId to query specific jobs.',
    });
  });
}
