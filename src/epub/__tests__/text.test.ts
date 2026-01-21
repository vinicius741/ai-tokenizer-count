/**
 * Tests for text extraction and word counting
 */

import { countWords } from '../text.js';

function assertEqual(actual: number, expected: number, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

console.log('Testing word counting...');

// Test 1: Basic English text
const test1 = countWords('Hello world');
assertEqual(test1, 2, 'Test 1: Basic English text');
console.log('✓ Test 1 passed: Basic English text');

// Test 2: Multiple spaces
const test2 = countWords('Hello    world   test');
assertEqual(test2, 3, 'Test 2: Multiple spaces');
console.log('✓ Test 2 passed: Multiple spaces');

// Test 3: HTML tags (should not be counted)
const test3 = countWords('<p>Hello world</p>');
assertEqual(test3, 2, 'Test 3: HTML tags');
console.log('✓ Test 3 passed: HTML tags excluded');

// Test 4: HTML tags with attributes
const test4 = countWords('<div class="content">Hello world</div>');
assertEqual(test4, 2, 'Test 4: HTML tags with attributes');
console.log('✓ Test 4 passed: HTML tags with attributes excluded');

// Test 5: CJK characters (Chinese) - treated as one word when no spaces
const test5 = countWords('你好世界');
assertEqual(test5, 1, 'Test 5: CJK characters');
console.log('✓ Test 5 passed: CJK characters counted as one word');

// Test 6: Mixed English and CJK
const test6 = countWords('Hello world 你好世界');
assertEqual(test6, 3, 'Test 6: Mixed English and CJK');
console.log('✓ Test 6 passed: Mixed English and CJK');

// Test 7: Empty string
const test7 = countWords('');
assertEqual(test7, 0, 'Test 7: Empty string');
console.log('✓ Test 7 passed: Empty string returns 0');

// Test 8: Only whitespace
const test8 = countWords('   ');
assertEqual(test8, 0, 'Test 8: Only whitespace');
console.log('✓ Test 8 passed: Only whitespace returns 0');

// Test 9: Only punctuation (no valid words)
const test9 = countWords('... --- !!!');
assertEqual(test9, 0, 'Test 9: Only punctuation');
console.log('✓ Test 9 passed: Only punctuation returns 0');

// Test 10: Numbers
const test10 = countWords('123 456 789');
assertEqual(test10, 3, 'Test 10: Numbers');
console.log('✓ Test 10 passed: Numbers counted');

// Test 11: Mixed alphanumeric
const test11 = countWords('abc123 def456');
assertEqual(test11, 2, 'Test 11: Alphanumeric');
console.log('✓ Test 11 passed: Alphanumeric counted');

// Test 12: Newlines and tabs
const test12 = countWords('Hello\nworld\ttest');
assertEqual(test12, 3, 'Test 12: Newlines and tabs');
console.log('✓ Test 12 passed: Newlines and tabs handled');

// Test 13: HTML tag without closing (edge case)
const test13 = countWords('<p>Hello world');
assertEqual(test13, 2, 'Test 13: Unclosed HTML tag');
console.log('✓ Test 13 passed: Unclosed HTML tag handled');

// Test 14: Nested HTML tags
const test14 = countWords('<div><p>Hello <strong>world</strong></p></div>');
assertEqual(test14, 2, 'Test 14: Nested HTML tags');
console.log('✓ Test 14 passed: Nested HTML tags excluded');

// Test 15: Words with hyphens (hyphenated words treated as single word)
const test15 = countWords('state-of-the-art technology');
assertEqual(test15, 2, 'Test 15: Hyphenated words');
console.log('✓ Test 15 passed: Hyphenated words counted as one word');

console.log('\nAll word counting tests passed!');
