import type { HealthResponse } from '@epub-counter/shared'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { listModelsHandler } from './routes/list-models.js'
import { processHandler } from './routes/process.js'
import { sseHandler } from './routes/sse.js'
import { jobStatusHandler } from './routes/job-status.js'
import { uploadResultsHandler } from './routes/upload-results.js'

const fastify = Fastify({
  logger: true,
})

// Register CORS for frontend communication
await fastify.register(cors, {
  origin: true, // Allow all origins in development
})

// Register list-models route
await fastify.register(listModelsHandler)

// Register process route
await fastify.register(processHandler)

// Register SSE route for real-time progress
await fastify.register(sseHandler)

// Register job status route
await fastify.register(jobStatusHandler)

// Register upload results route
await fastify.register(uploadResultsHandler)

// Health check endpoint
fastify.get('/api/health', async (): Promise<HealthResponse> => {
  return {
    status: 'healthy',
    version: '1.0.0',
    uptime: process.uptime(),
  }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 8787, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
