/**
 * Tests for Hugging Face model registry
 */

import { HF_MODELS, getModelList, getModelsByArchitecture, searchModels, HFModelInfo } from '../hf-models.js';

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

function assertArrayLength<T>(arr: T[], expectedLength: number, message: string): void {
  if (arr.length !== expectedLength) {
    throw new Error(`${message}\n  Expected length: ${expectedLength}\n  Actual length: ${arr.length}`);
  }
}

function assertArrayContains<T>(arr: T[], item: T, message: string): void {
  if (!arr.includes(item)) {
    throw new Error(`${message}\n  Array does not contain: ${item}`);
  }
}

console.log('Testing Hugging Face model registry...');

// Test 1: getModelList returns all models
const allModels = getModelList();
assertArrayLength(allModels, HF_MODELS.length, 'getModelList() should return all models');
console.log('✓ Test 1 passed: getModelList returns all models');

// Test 2: Models have required fields
for (const model of allModels) {
  if (!model.name || typeof model.name !== 'string') {
    throw new Error(`Model missing valid name: ${JSON.stringify(model)}`);
  }
  if (!model.description || typeof model.description !== 'string') {
    throw new Error(`Model missing valid description: ${JSON.stringify(model)}`);
  }
  if (!model.architecture || typeof model.architecture !== 'string') {
    throw new Error(`Model missing valid architecture: ${JSON.stringify(model)}`);
  }
}
console.log('✓ Test 2 passed: All models have required fields');

// Test 3: getModelsByArchitecture groups correctly
const grouped = getModelsByArchitecture();
const architectures = Object.keys(grouped);

// Should have multiple architectures
assertEqual(architectures.length > 1, true, 'Should have multiple architecture groups');
console.log(`✓ Test 3 passed: Models grouped into ${architectures.length} architectures`);

// Test 4: Each model appears in correct architecture group
for (const model of allModels) {
  const group = grouped[model.architecture];
  if (!group) {
    throw new Error(`Architecture "${model.architecture}" not found in grouped models`);
  }
  const found = group.some(m => m.name === model.name);
  if (!found) {
    throw new Error(`Model "${model.name}" not found in its architecture group "${model.architecture}"`);
  }
}
console.log('✓ Test 4 passed: All models in correct architecture groups');

// Test 5: searchModels finds by name
const bertResults = searchModels('bert');
assertEqual(bertResults.length > 0, true, 'Should find models with "bert" in name');
for (const model of bertResults) {
  const matches = model.name.toLowerCase().includes('bert') ||
                 model.description.toLowerCase().includes('bert') ||
                 model.architecture.toLowerCase().includes('bert');
  if (!matches) {
    throw new Error(`Search result "${model.name}" does not match query "bert"`);
  }
}
console.log(`✓ Test 5 passed: searchModels finds ${bertResults.length} models for "bert"`);

// Test 6: searchModels is case-insensitive
const lowerResults = searchModels('gpt');
const upperResults = searchModels('GPT');
assertArrayLength(lowerResults, upperResults.length, 'Search should be case-insensitive');
console.log('✓ Test 6 passed: searchModels is case-insensitive');

// Test 7: searchModels returns empty for non-matching query
const noResults = searchModels('nonexistent-model-xyz-123');
assertArrayLength(noResults, 0, 'Search should return empty for non-matching query');
console.log('✓ Test 7 passed: searchModels returns empty for non-matching query');

// Test 8: Known popular models exist
const popularModels = [
  'bert-base-uncased',
  'gpt2',
  'Xenova/bert-base-uncased',
  'meta-llama/Llama-2-7b'
];
for (const modelName of popularModels) {
  const found = allModels.some(m => m.name === modelName);
  if (!found) {
    throw new Error(`Popular model "${modelName}" not found in registry`);
  }
}
console.log('✓ Test 8 passed: All popular models exist in registry');

// Test 9: Xenova models have ONNX tag
const xenovaModels = allModels.filter(m => m.name.startsWith('Xenova/'));
for (const model of xenovaModels) {
  if (model.tag !== 'ONNX') {
    throw new Error(`Xenova model "${model.name}" should have ONNX tag`);
  }
}
console.log(`✓ Test 9 passed: All ${xenovaModels.length} Xenova models have ONNX tag`);

// Test 10: Architecture groups are sorted consistently
const grouped2 = getModelsByArchitecture();
const keys1 = Object.keys(grouped).sort();
const keys2 = Object.keys(grouped2).sort();
assertEqual(keys1.length, keys2.length, 'Architecture count should be consistent');
for (let i = 0; i < keys1.length; i++) {
  assertEqual(keys1[i], keys2[i], `Architecture key at index ${i} should be consistent`);
}
console.log('✓ Test 10 passed: Architecture groups are consistent');

console.log('\nAll 10 tests passed!');
