/**
 * Tests for metadata extraction
 */

import { extractMetadata, EpubMetadata } from '../metadata.js';

function assertMetadata(actual: EpubMetadata, expected: Partial<EpubMetadata>) {
  if (expected.title !== undefined) {
    if (actual.title !== expected.title) {
      throw new Error(`Expected title "${expected.title}", got "${actual.title}"`);
    }
  }
  if (expected.author !== undefined) {
    if (actual.author !== expected.author) {
      throw new Error(`Expected author "${expected.author}", got "${actual.author}"`);
    }
  }
  if (expected.language !== undefined) {
    if (actual.language !== expected.language) {
      throw new Error(`Expected language "${expected.language}", got "${actual.language}"`);
    }
  }
  if (expected.publisher !== undefined) {
    if (actual.publisher !== expected.publisher) {
      throw new Error(`Expected publisher "${expected.publisher}", got "${actual.publisher}"`);
    }
  }
}

console.log('Testing metadata extraction...');

// Test 1: Complete metadata
const completeInfo = {
  info: {
    title: 'Test Book',
    creator: 'Test Author',
    language: 'en',
    publisher: 'Test Publisher'
  }
};
const result1 = extractMetadata(completeInfo);
assertMetadata(result1, {
  title: 'Test Book',
  author: 'Test Author',
  language: 'en',
  publisher: 'Test Publisher'
});
console.log('✓ Test 1 passed: Complete metadata');

// Test 2: Missing optional fields
const partialInfo = {
  info: {
    title: 'Partial Book',
    creator: 'Partial Author'
  }
};
const result2 = extractMetadata(partialInfo);
assertMetadata(result2, {
  title: 'Partial Book',
  author: 'Partial Author',
  language: undefined,
  publisher: undefined
});
console.log('✓ Test 2 passed: Missing optional fields');

// Test 3: Missing required fields (use defaults)
const missingRequiredInfo = {
  info: {
    language: 'en'
  }
};
const result3 = extractMetadata(missingRequiredInfo);
assertMetadata(result3, {
  title: 'Unknown Title',
  author: 'Unknown Author',
  language: 'en'
});
console.log('✓ Test 3 passed: Missing required fields use defaults');

// Test 4: Empty/undefined epubInfo
const result4 = extractMetadata(null);
assertMetadata(result4, {
  title: 'Unknown Title',
  author: 'Unknown Author'
});
console.log('✓ Test 4 passed: Null epubInfo returns defaults');

const result5 = extractMetadata(undefined);
assertMetadata(result5, {
  title: 'Unknown Title',
  author: 'Unknown Author'
});
console.log('✓ Test 5 passed: Undefined epubInfo returns defaults');

const result6 = extractMetadata({});
assertMetadata(result6, {
  title: 'Unknown Title',
  author: 'Unknown Author'
});
console.log('✓ Test 6 passed: Empty object returns defaults');

console.log('\nAll tests passed!');
