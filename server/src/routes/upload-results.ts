/**
 * Upload Results Route
 *
 * Provides POST /api/upload-results endpoint for validating and processing
 * results.json files uploaded by users. Validates the schema and returns
 * success/error responses with detailed error messages.
 *
 * @module routes/upload-results
 */

import type { FastifyInstance } from 'fastify';
import type { ResultsOutput } from '@epub-counter/shared';
import { validateResultsOutput } from '../lib/schema-validator.js';

/**
 * API success response format
 */
interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * API error response format
 */
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

/**
 * Upload results success data
 */
interface UploadResultsSuccessData {
  message: string;
  resultsCount: number;
  summary: {
    total: number;
    success: number;
    failed: number;
  };
}

/**
 * Upload results route handler
 *
 * Registers POST /api/upload-results endpoint that accepts results.json
 * data via raw JSON body (no multipart upload needed). Validates the
 * schema and returns success/error responses.
 *
 * @param fastify - Fastify instance
 * @returns Promise that resolves when routes are registered
 *
 * @example
 * ```ts
 * await fastify.register(uploadResultsHandler)
 * ```
 */
export async function uploadResultsHandler(fastify: FastifyInstance): Promise<void> {
  // Set body limit to 1MB for results uploads
  fastify.addContentTypeParser('application/json', { bodyLimit: 1024 * 1024 }, async (_request, body) => {
    return JSON.parse(body as string);
  });

  // POST /api/upload-results - Upload and validate results.json
  fastify.post<{
    Body: unknown;
  }>(
    '/api/upload-results',
    {
      schema: {
        description: 'Upload and validate results.json file',
        consumes: ['application/json'],
        response: {
          200: {
            description: 'Results validated successfully',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  resultsCount: { type: 'number' },
                  summary: {
                    type: 'object',
                    properties: {
                      total: { type: 'number' },
                      success: { type: 'number' },
                      failed: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid results.json format',
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  details: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Get JSON body (already parsed by content type parser)
      const data = request.body;

      // Validate against ResultsOutput schema
      const validation = validateResultsOutput(data);

      // Return 400 if validation fails
      if (!validation.valid) {
        const errorResponse: ApiErrorResponse = {
          error: {
            code: 'INVALID_SCHEMA',
            message: 'Invalid results.json format',
            details: validation.errors,
          },
        };
        return reply.status(400).send(errorResponse);
      }

      // Type assertion after validation
      const results = data as ResultsOutput;

      // Return success response
      const successResponse: ApiSuccessResponse<UploadResultsSuccessData> = {
        success: true,
        data: {
          message: 'Results validated successfully',
          resultsCount: results.results.length,
          summary: results.summary,
        },
      };

      return reply.status(200).send(successResponse);
    }
  );
}
