import Fastify from 'fastify'
import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true,
})

// Register CORS for frontend communication
await fastify.register(cors, {
  origin: true, // Allow all origins in development
})

// Health check endpoint
fastify.get('/api/health', async () => {
  return { status: 'ok' }
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
