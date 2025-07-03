/* eslint-disable max-len, max-statements */
import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  generateOutputContent,
  getOutputExtension,
  isValidFormat
} from '../../src/formatters/output-formatter.js';

/**
 * Gets mock snippets for testing
 * @returns {Array} Mock snippets array
 */
function getMockSnippets() {
  return [
    {
      title: 'Test Snippet 1',
      description: 'First test snippet',
      source: 'test1.md',
      language: 'javascript',
      code: 'console.log("test1");'
    },
    {
      title: 'Test Snippet 2',
      description: 'Second test snippet',
      source: 'test2.md',
      language: 'python',
      code: 'print("test2")'
    }
  ];
}

/**
 * Gets mock output info for testing
 * @returns {Object} Mock output info
 */
function getMockOutputInfo() {
  return {
    outputPath: '/output/test.md',
    outputDir: '/output',
    outputFileName: 'test',
    atTag: 'test',
    source: 'test.md'
  };
}

/**
 * Asserts MD format content
 * @param {string} content - Generated content
 */
function assertMdFormat(content) {
  assert(content.includes('TITLE: Test Snippet 1'));
  assert(content.includes('TITLE: Test Snippet 2'));
  assert(content.includes('@test'));
  // Note: md format doesn't have frontmatter, but the content might contain --- from snippet separators
  assert(!content.includes('description: test')); // No frontmatter description for md
}

/**
 * Asserts MDC format content
 * @param {string} content - Generated content
 */
function assertMdcFormat(content) {
  assert(content.includes('---'));
  assert(content.includes('description: test'));
  assert(content.includes('alwaysApply: true'));
  assert(content.includes('TITLE: Test Snippet 1'));
  assert(content.includes('TITLE: Test Snippet 2'));
  assert(content.includes('@test'));
}

/**
 * Asserts incomplete snippets content
 * @param {string} content - Generated content
 */
function assertIncompleteSnippets(content) {
  assert(content.includes('TITLE: Test Snippet'));
  assert(content.includes('DESCRIPTION: '));
  assert(content.includes('SOURCE: '));
  assert(content.includes('LANGUAGE: text'));
}

describe('Output Formatter', () => {
  const mockSnippets = getMockSnippets();
  const mockOutputInfo = getMockOutputInfo();

  test('should generate md format content', () => {
    const content = generateOutputContent(mockSnippets, mockOutputInfo, 'md');
    assertMdFormat(content);
  });

  test('should generate mdc format content with frontmatter', () => {
    const content = generateOutputContent(mockSnippets, mockOutputInfo, 'mdc');
    assertMdcFormat(content);
  });

  test('should handle empty snippets array', () => {
    const content = generateOutputContent([], mockOutputInfo, 'md');
    assert.strictEqual(content, '');
  });

  test('should handle null snippets', () => {
    const content = generateOutputContent(null, mockOutputInfo, 'md');
    assert.strictEqual(content, '');
  });

  test('should handle snippets with missing fields', () => {
    const incompleteSnippets = [
      {
        title: 'Test Snippet',
        code: 'console.log("test");'
      }
    ];

    const content = generateOutputContent(incompleteSnippets, mockOutputInfo, 'md');
    assertIncompleteSnippets(content);
  });

  test('should handle at-tag without @ prefix', () => {
    const outputInfo = { ...mockOutputInfo, atTag: 'mytag' };
    const content = generateOutputContent(mockSnippets, outputInfo, 'md');

    assert(content.includes('@mytag'));
  });

  test('should handle at-tag with @ prefix', () => {
    const outputInfo = { ...mockOutputInfo, atTag: '@mytag' };
    const content = generateOutputContent(mockSnippets, outputInfo, 'md');

    assert(content.includes('@mytag'));
  });

  test('should handle empty at-tag', () => {
    const outputInfo = { ...mockOutputInfo, atTag: '' };
    const content = generateOutputContent(mockSnippets, outputInfo, 'md');

    assert(content.endsWith('\n\n'));
  });

  test('should get correct output extension for md format', () => {
    const extension = getOutputExtension('md');
    assert.strictEqual(extension, '.md');
  });

  test('should get correct output extension for mdc format', () => {
    const extension = getOutputExtension('mdc');
    assert.strictEqual(extension, '.mdc');
  });

  test('should validate md format', () => {
    assert.strictEqual(isValidFormat('md'), true);
  });

  test('should validate mdc format', () => {
    assert.strictEqual(isValidFormat('mdc'), true);
  });

  test('should reject invalid format', () => {
    assert.strictEqual(isValidFormat('invalid'), false);
    assert.strictEqual(isValidFormat(''), false);
    assert.strictEqual(isValidFormat(null), false);
  });

  test('should handle single snippet', () => {
    const singleSnippet = [mockSnippets[0]];
    const content = generateOutputContent(singleSnippet, mockOutputInfo, 'md');

    assert(content.includes('TITLE: Test Snippet 1'));
    assert(!content.includes('TITLE: Test Snippet 2'));
    assert(content.includes('@test'));
  });

  test('should preserve snippet order', () => {
    const content = generateOutputContent(mockSnippets, mockOutputInfo, 'md');

    const firstIndex = content.indexOf('TITLE: Test Snippet 1');
    const secondIndex = content.indexOf('TITLE: Test Snippet 2');

    assert(firstIndex < secondIndex);
  });
});
