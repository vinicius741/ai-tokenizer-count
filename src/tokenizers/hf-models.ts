/**
 * Hugging Face Model Registry
 *
 * Curated list of popular Hugging Face models compatible with transformers.js.
 * These models can be used with the hf:<model-name> tokenizer format.
 *
 * Updated quarterly or when major models are released.
 * Source: https://huggingface.co/models?library=transformers.js
 *
 * @module tokenizers/hf-models
 */

/**
 * Information about a Hugging Face model
 */
export interface HFModelInfo {
  /** Model identifier (use with hf: prefix) */
  name: string;
  /** Human-readable description */
  description: string;
  /** Model architecture/family */
  architecture: string;
  /** Optional tag (e.g., 'ONNX' for faster Xenova conversions) */
  tag?: string;
}

/**
 * Curated list of popular Hugging Face models for tokenization
 *
 * Models are organized by architecture for easy discovery.
 * Xenova models are ONNX-converted versions that load faster.
 */
export const HF_MODELS: HFModelInfo[] = [
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
];

/**
 * Get all models in the registry
 */
export function getModelList(): HFModelInfo[] {
  return HF_MODELS;
}

/**
 * Group models by architecture
 */
export function getModelsByArchitecture(): Record<string, HFModelInfo[]> {
  const grouped: Record<string, HFModelInfo[]> = {};

  for (const model of HF_MODELS) {
    if (!grouped[model.architecture]) {
      grouped[model.architecture] = [];
    }
    grouped[model.architecture].push(model);
  }

  return grouped;
}

/**
 * Search models by name, description, or architecture
 */
export function searchModels(query: string): HFModelInfo[] {
  const q = query.toLowerCase();
  return HF_MODELS.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.architecture.toLowerCase().includes(q)
  );
}
