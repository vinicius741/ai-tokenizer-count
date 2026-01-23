/**
 * List Models API Route
 *
 * GET /api/list-models endpoint that returns all available tokenizers
 * (GPT-4, Claude, and popular Hugging Face models).
 *
 * @module routes/list-models
 */

import type { TokenizerInfo, TokenizerType } from '@epub-counter/shared'
import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

/**
 * Hugging Face models list
 *
 * Copied from src/tokenizers/hf-models.ts to avoid cross-package compilation issues.
 * Source of truth is the CLI hf-models.ts file.
 */
const HF_MODELS: Array<{
  name: string
  description: string
  architecture: string
  tag?: string
}> = [
  // BERT family
  {
    name: 'bert-base-uncased',
    description: 'BERT base model (uncased)',
    architecture: 'BERT',
  },
  {
    name: 'Xenova/bert-base-uncased',
    description: 'BERT base (ONNX, faster loading)',
    architecture: 'BERT',
    tag: 'ONNX',
  },
  {
    name: 'bert-large-uncased',
    description: 'BERT large model (uncased)',
    architecture: 'BERT',
  },

  // DistilBERT
  {
    name: 'distilbert-base-uncased',
    description: 'DistilBERT base (faster, lighter BERT)',
    architecture: 'DistilBERT',
  },

  // RoBERTa
  {
    name: 'roberta-base',
    description: 'RoBERTa base model',
    architecture: 'RoBERTa',
  },

  // GPT family
  {
    name: 'gpt2',
    description: 'GPT-2 small (117M params)',
    architecture: 'GPT-2',
  },
  {
    name: 'Xenova/gpt2',
    description: 'GPT-2 small (ONNX)',
    architecture: 'GPT-2',
    tag: 'ONNX',
  },
  {
    name: 'gpt2-medium',
    description: 'GPT-2 medium (345M params)',
    architecture: 'GPT-2',
  },

  // Llama family
  {
    name: 'meta-llama/Llama-2-7b',
    description: 'Llama 2 7B',
    architecture: 'Llama',
  },
  {
    name: 'meta-llama/Llama-2-13b',
    description: 'Llama 2 13B',
    architecture: 'Llama',
  },
  {
    name: 'meta-llama/Meta-Llama-3-8B',
    description: 'Llama 3 8B',
    architecture: 'Llama',
  },

  // Mistral
  {
    name: 'mistralai/Mistral-7B-v0.1',
    description: 'Mistral 7B',
    architecture: 'Mistral',
  },

  // Phi
  {
    name: 'microsoft/phi-3-mini-4k-instruct',
    description: 'Phi-3 mini (4K context)',
    architecture: 'Phi',
  },

  // Qwen
  {
    name: 'Qwen/Qwen2-7B',
    description: 'Qwen2 7B (multilingual)',
    architecture: 'Qwen',
  },

  // T5
  {
    name: 't5-base',
    description: 'T5 base (text-to-text)',
    architecture: 'T5',
  },

  // BART
  {
    name: 'facebook/bart-base',
    description: 'BART base (seq2seq)',
    architecture: 'BART',
  },
]

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
