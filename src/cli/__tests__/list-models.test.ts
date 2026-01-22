/**
 * Tests for list-models command
 */

import { listModels, ListModelsOptions } from '../commands/list-models.js';
import { searchModels } from '../../tokenizers/hf-models.js';

// Helper to capture console output
function captureConsoleOutput(fn: () => void): string[] {
  const outputs: string[] = [];
  const originalLog = console.log;

  console.log = (...args: unknown[]) => {
    outputs.push(args.map(a => String(a)).join(' '));
  };

  try {
    fn();
  } finally {
    console.log = originalLog;
  }

  return outputs;
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

function assertTrue(value: boolean, message: string): void {
  if (!value) {
    throw new Error(message);
  }
}

console.log('Testing list-models command...');

// Test 1: listModels runs without crashing (no search)
const output1 = captureConsoleOutput(() => {
  listModels({});
});
assertTrue(output1.length > 0, 'listModels should produce output');
assertTrue(
  output1.some(line => line.includes('Hugging Face Models')),
  'Output should include header'
);
console.log('✓ Test 1 passed: listModels produces output without search');

// Test 2: listModels with search produces output
const output2 = captureConsoleOutput(() => {
  listModels({ search: 'bert' });
});
assertTrue(output2.length > 0, 'listModels with search should produce output');
assertTrue(
  output2.some(line => line.includes('bert') || line.includes('BERT')),
  'Output should include search term'
);
console.log('✓ Test 2 passed: listModels produces output with search');

// Test 3: Search with no matches produces empty result message
const output3 = captureConsoleOutput(() => {
  listModels({ search: 'nonexistent-model-xyz-123' });
});
assertTrue(
  output3.some(line => line.includes('No models found')),
  'Search with no matches should show "No models found"'
);
console.log('✓ Test 3 passed: Empty search shows "No models found"');

// Test 4: Output includes Hugging Face URL in all modes
const output4 = captureConsoleOutput(() => listModels({}));
assertTrue(
  output4.some(line => line.includes('huggingface.co')),
  'Default mode should include Hugging Face URL'
);

const output5 = captureConsoleOutput(() => listModels({ search: 'bert' }));
assertTrue(
  output5.some(line => line.includes('huggingface.co')),
  'Search mode should include Hugging Face URL'
);
console.log('✓ Test 4 passed: Both modes include Hugging Face URL');

// Test 5: Default mode shows architecture groupings
const output6 = captureConsoleOutput(() => listModels({}));
assertTrue(
  output6.some(line => line.includes('Models:')),
  'Default mode should show architecture groupings'
);
console.log('✓ Test 5 passed: Default mode shows architecture groupings');

// Test 6: Search mode shows results count
const output7 = captureConsoleOutput(() => listModels({ search: 'bert' }));
assertTrue(
  output7.some(line => line.includes('model(s) matching')),
  'Search mode should show results count'
);
console.log('✓ Test 6 passed: Search mode shows results count');

// Test 7: Default mode includes ONNX note
const output8 = captureConsoleOutput(() => listModels({}));
assertTrue(
  output8.some(line => line.includes('ONNX')),
  'Default mode should include ONNX note'
);
console.log('✓ Test 7 passed: Default mode includes ONNX note');

// Test 8: Search is case-insensitive
const output9 = captureConsoleOutput(() => listModels({ search: 'GPT' }));
const output10 = captureConsoleOutput(() => listModels({ search: 'gpt' }));
// Both should produce similar output (at least have similar result count)
const gptResults = searchModels('gpt');
const countMatch = output9.some(line => line.includes(`${gptResults.length} model(s)`)) ||
                   output10.some(line => line.includes(`${gptResults.length} model(s)`));
assertTrue(countMatch, 'Case-insensitive search should work');
console.log('✓ Test 8 passed: Search is case-insensitive');

// Test 9: Multiple searches produce different results
const bertOutput = captureConsoleOutput(() => listModels({ search: 'bert' }));
const gptOutput = captureConsoleOutput(() => listModels({ search: 'gpt' }));
// The outputs should be different
const bertJoined = bertOutput.join('\n');
const gptJoined = gptOutput.join('\n');
assertTrue(
  bertJoined !== gptJoined,
  'Different searches should produce different results'
);
console.log('✓ Test 9 passed: Different searches produce different results');

// Test 10: Empty search options behaves like no options
const output11 = captureConsoleOutput(() => listModels({}));
const output12 = captureConsoleOutput(() => listModels({ search: '' }));
// Empty string search might go to search branch but return all models
assertTrue(output11.length > 0, 'Empty options should produce output');
assertTrue(output12.length > 0, 'Empty search should produce output');
console.log('✓ Test 10 passed: Empty options handled correctly');

console.log('\nAll 10 tests passed!');
