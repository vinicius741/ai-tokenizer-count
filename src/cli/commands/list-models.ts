/**
 * List Hugging Face Models Command
 *
 * CLI command to display popular Hugging Face models
 * that are compatible with transformers.js.
 *
 * @module cli/commands/list-models
 */

import Table from 'cli-table3';
import { getModelsByArchitecture, searchModels } from '../../tokenizers/hf-models.js';

/**
 * Options for the list-models command
 */
export interface ListModelsOptions {
  /** Optional search query to filter models */
  search?: string;
}

/**
 * Display Hugging Face models in a formatted table
 *
 * Shows model names with the hf: prefix for easy copy-paste,
 * grouped by architecture.
 *
 * @param options - Command options
 * @returns void - Outputs directly to console
 *
 * @example
 * ```ts
 * listModels(); // List all models grouped by architecture
 * listModels({ search: 'bert' }); // Search for models containing 'bert'
 * ```
 */
export function listModels(options: ListModelsOptions = {}): void {
  console.log('Hugging Face Models (transformers.js compatible)\n');

  if (options.search) {
    // Search mode - display matching models
    const results = searchModels(options.search);

    if (results.length === 0) {
      console.log(`No models found matching "${options.search}"`);
      console.log(`\nBrowse all models: https://huggingface.co/models?library=transformers.js`);
      return;
    }

    const table = new Table({
      head: ['Model', 'Description', 'Arch'],
      wordWrap: true,
      style: {
        head: ['cyan', 'bold'],
        border: ['grey'],
      },
    });

    for (const model of results) {
      const tag = model.tag ? ` [${model.tag}]` : '';
      table.push([`hf:${model.name}${tag}`, model.description, model.architecture]);
    }

    console.log(table.toString());
    console.log(`\nFound ${results.length} model(s) matching "${options.search}"`);
  } else {
    // Default mode - display models grouped by architecture
    const grouped = getModelsByArchitecture();

    for (const [architecture, models] of Object.entries(grouped)) {
      console.log(`${architecture} Models:`);

      const table = new Table({
        head: ['Model', 'Description'],
        wordWrap: true,
        style: {
          head: ['cyan', 'bold'],
          border: ['grey'],
        },
      });

      for (const model of models) {
        const tag = model.tag ? ` [${model.tag}]` : '';
        table.push([`  hf:${model.name}${tag}`, model.description]);
      }

      console.log(table.toString());
    }

    console.log(`[ONNX] = Faster loading via Xenova conversions`);
  }

  console.log(`\nBrowse all models: https://huggingface.co/models?library=transformers.js`);
}
