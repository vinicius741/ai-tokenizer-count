/**
 * Process API Route
 *
 * POST /api/process endpoint that accepts EPUB folder path and tokenizers,
 * queues processing job, returns job ID immediately.
 *
 * @module routes/process
 */

import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import type {
  ProcessRequest,
  JobStatus,
  TokenizerType,
} from '@epub-counter/shared'
import { jobQueue } from '../lib/job-queue.js'
import { validatePath, isPathTraversal } from '../lib/path-validator.js'

/**
 * Process response when job is queued successfully
 */
interface ProcessResponse {
  /** Unique job identifier for status tracking */
  jobId: string
  /** Current job status */
  status: JobStatus
}

/**
 * Error response format
 */
interface ProcessErrorResponse {
  error: {
    /** Machine-readable error code */
    code: string
    /** Human-readable error message */
    message: string
    /** Additional error details (optional) */
    details?: string
  }
}

/**
 * Error codes for process endpoint
 */
enum ErrorCode {
  /** Path traversal detected or path doesn't exist */
  INVALID_PATH = 'INVALID_PATH',
  /** Tokenizers array is empty or invalid */
  INVALID_TOKENIZERS = 'INVALID_TOKENIZERS',
  /** Missing required fields in request */
  INVALID_REQUEST = 'INVALID_REQUEST',
}

/**
 * Request body schema validation
 */
interface ProcessRequestBody {
  /** EPUB folder path on server (required) */
  path: string
  /** Tokenizers to use (required, non-empty array) */
  tokenizers: TokenizerType[]
  /** Include subdirectories (optional, default: false) */
  recursive?: boolean
  /** Max EPUB text size in MB (optional, default: 500) */
  maxMb?: number
}

/**
 * Process Route Handler
 *
 * Registers POST /api/process endpoint that:
 * 1. Validates request body (path, tokenizers)
 * 2. Validates path exists and prevents traversal
 * 3. Enqueues job in background queue
 * 4. Returns job ID immediately (< 100ms)
 *
 * @param fastify - Fastify instance
 *
 * @example
 * ```bash
 * curl -X POST http://localhost:8787/api/process \
 *   -H "Content-Type: application/json" \
 *   -d '{"path":"./epubs","tokenizers":["gpt4","claude"],"recursive":true}'
 * ```
 */
export async function processHandler(
  fastify: FastifyInstance
): Promise<void> {
  fastify.post<{
    Body: ProcessRequestBody
    Reply: ProcessResponse | ProcessErrorResponse
  }>(
    '/api/process',
    {
      schema: {
        description: 'Queue EPUB processing job',
        tags: ['processing'],
        body: {
          type: 'object',
          required: ['path', 'tokenizers'],
          properties: {
            path: { type: 'string', description: 'EPUB folder path' },
            tokenizers: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              description: 'Tokenizers to use',
            },
            recursive: {
              type: 'boolean',
              description: 'Include subdirectories',
            },
            maxMb: {
              type: 'number',
              description: 'Max EPUB text size in MB',
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              jobId: { type: 'string' },
              status: { type: 'string', enum: ['queued'] },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  details: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body

      // Validate required fields
      if (!body.path || typeof body.path !== 'string') {
        reply.code(400)
        return {
          error: {
            code: ErrorCode.INVALID_REQUEST,
            message: 'Missing or invalid "path" field',
            details: 'Path must be a non-empty string',
          },
        }
      }

      if (
        !body.tokenizers ||
        !Array.isArray(body.tokenizers) ||
        body.tokenizers.length === 0
      ) {
        reply.code(400)
        return {
          error: {
            code: ErrorCode.INVALID_TOKENIZERS,
            message: 'Missing or empty "tokenizers" array',
            details: 'Tokenizers must be a non-empty array',
          },
        }
      }

      // Quick path traversal check before filesystem validation
      if (isPathTraversal(body.path)) {
        reply.code(400)
        return {
          error: {
            code: ErrorCode.INVALID_PATH,
            message: 'Path traversal detected',
            details: 'Path cannot contain ".." (parent directory) or "~" (home directory)',
          },
        }
      }

      // Validate path exists and is accessible
      const pathValidation = await validatePath(body.path)
      if (!pathValidation.valid) {
        reply.code(400)
        return {
          error: {
            code: ErrorCode.INVALID_PATH,
            message: pathValidation.error || 'Invalid path',
            details: pathValidation.error,
          },
        }
      }

      // Build process request
      const processRequest: ProcessRequest = {
        path: pathValidation.resolvedPath!,
        tokenizers: body.tokenizers,
        recursive: body.recursive ?? false,
        maxMb: body.maxMb ?? 500,
      }

      // Enqueue job (returns immediately)
      const jobId = jobQueue.enqueue(processRequest)

      // Return 201 with job ID
      reply.code(201)
      return {
        jobId,
        status: 'queued',
      }
    }
  )
}

// Export as fastify plugin for registration
export default fp(processHandler, {
  name: 'process',
})
