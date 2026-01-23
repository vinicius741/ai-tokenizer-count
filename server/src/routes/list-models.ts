/**
 * List Models API Route
 *
 * GET /api/list-models endpoint that returns all available tokenizers
 * (GPT-4, Claude, and popular Hugging Face models).
 *
 * @module routes/list-models
 */

import type { TokenizerInfo, TokenizerType } from '@epub-counter/shared'
import { fp } from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'
import { HF_MODELS } from '../../../src/tokenizers/hf-models.js'

/**
 * List of all available tokenizers
 *
 * Includes GPT-4, Claude, and all Hugging Face models from the registry.
 */
const LIST_MODELS: TokenizerInfo[] = [
  {
    id: 'gpt4',
    name: 'GPT-4',
    description: 'OpenAI GPT-4 tokenizer (cl100k_base)',
    async: false,
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic Claude tokenizer',
    async: false,
  },
  // Convert all HF models to TokenizerInfo format with 'hf:' prefix
  ...HF_MODELS.map(
    (model): TokenizerInfo => ({
      id: `hf:${model.name}` as TokenizerType,
      name: model.name,
      description: model.description,
      async: true,
    })
  ),
]

/**
 * List Models Route Handler
 *
 * Registers GET /api/list-models endpoint that returns all available tokenizers.
 *
 * @param fastify - Fastify instance
 */
export async function listModelsHandler(
  fastify: FastifyInstance
): Promise<void> {
  fastify.get(
    '/api/list-models',
    async (): Promise<{ success: true; data: TokenizerInfo[] }> => {
      return {
        success: true,
        data: LIST_MODELS,
      }
    }
  )
}

// Export as fastify plugin for registration
export default fp(listModelsHandler, {
  name: 'list-models',
})
