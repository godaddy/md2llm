import { test, describe } from 'node:test';
import assert from 'node:assert';
import { extractSnippetsFromTokens, formatSnippet } from '../../src/processors/snippet-extractor.js';

describe('Snippet Extractor', () => {
  test('should extract snippets from markdown tokens', () => {
    const tokens = [
      { type: 'heading_open', tag: 'h1' },
      { type: 'inline', content: 'Test Heading' },
      { type: 'heading_close', tag: 'h1' },
      { type: 'paragraph_open', tag: 'p' },
      { type: 'inline', content: 'This is a description' },
      { type: 'paragraph_close', tag: 'p' },
      { type: 'fence', info: 'javascript', content: 'console.log("test");' },
      { type: 'paragraph_open', tag: 'p' },
      { type: 'inline', content: 'Another description' },
      { type: 'paragraph_close', tag: 'p' },
      { type: 'fence', info: 'python', content: 'print("hello")' }
    ];

    const snippets = extractSnippetsFromTokens(tokens, 'test.md');

    assert.strictEqual(snippets.length, 2);
    assert.strictEqual(snippets[0].title, 'Test Heading');
    assert.strictEqual(snippets[0].description, 'This is a description');
    assert.strictEqual(snippets[0].language, 'javascript');
    assert.strictEqual(snippets[0].code, 'console.log("test");');
    assert.strictEqual(snippets[0].source, 'test.md');

    assert.strictEqual(snippets[1].title, 'Test Heading');
    assert.strictEqual(snippets[1].description, 'Another description');
    assert.strictEqual(snippets[1].language, 'python');
    assert.strictEqual(snippets[1].code, 'print("hello")');
  });

  test('should handle snippets without headings', () => {
    const tokens = [
      { type: 'fence', info: 'javascript', content: 'console.log("test");' }
    ];

    const snippets = extractSnippetsFromTokens(tokens, 'test.md');

    assert.strictEqual(snippets.length, 1);
    assert.strictEqual(snippets[0].title, 'Snippet 1');
    assert.strictEqual(snippets[0].language, 'javascript');
  });

  test('should handle snippets without descriptions', () => {
    const tokens = [
      { type: 'fence', info: 'javascript', content: 'console.log("test");' }
    ];

    const snippets = extractSnippetsFromTokens(tokens, 'test.md');

    assert.strictEqual(snippets.length, 1);
    assert.strictEqual(snippets[0].description, '');
  });

  test('should handle empty tokens array', () => {
    const snippets = extractSnippetsFromTokens([], 'test.md');
    assert.deepStrictEqual(snippets, []);
  });

  test('should handle null tokens', () => {
    const snippets = extractSnippetsFromTokens(null, 'test.md');
    assert.deepStrictEqual(snippets, []);
  });

  test('should handle tokens without fence blocks', () => {
    const tokens = [
      { type: 'paragraph_open', tag: 'p' },
      { type: 'inline', content: 'Just some text' },
      { type: 'paragraph_close', tag: 'p' }
    ];

    const snippets = extractSnippetsFromTokens(tokens, 'test.md');
    assert.deepStrictEqual(snippets, []);
  });

  test('should format snippet correctly', () => {
    const snippet = {
      title: 'Test Snippet',
      description: 'A test description',
      source: 'test.md',
      language: 'javascript',
      code: 'console.log("test");'
    };

    const formatted = formatSnippet(snippet);

    assert(formatted.includes('TITLE: Test Snippet'));
    assert(formatted.includes('DESCRIPTION: A test description'));
    assert(formatted.includes('SOURCE: test.md'));
    assert(formatted.includes('LANGUAGE: javascript'));
    assert(formatted.includes('```javascript'));
    assert(formatted.includes('console.log("test");'));
    assert(formatted.includes('```'));
    assert(formatted.includes('----------------------------------------'));
  });

  test('should handle snippet with missing fields', () => {
    const snippet = {
      title: 'Test Snippet',
      code: 'console.log("test");'
    };

    const formatted = formatSnippet(snippet);

    assert(formatted.includes('TITLE: Test Snippet'));
    assert(formatted.includes('DESCRIPTION: '));
    assert(formatted.includes('SOURCE: '));
    assert(formatted.includes('LANGUAGE: text'));
  });

  test('should return empty string for invalid snippet', () => {
    const formatted = formatSnippet(null);
    assert.strictEqual(formatted, '');
  });

  test('should return empty string for snippet without title', () => {
    const snippet = {
      code: 'console.log("test");'
    };

    const formatted = formatSnippet(snippet);
    assert.strictEqual(formatted, '');
  });

  test('should return empty string for snippet without code', () => {
    const snippet = {
      title: 'Test Snippet'
    };

    const formatted = formatSnippet(snippet);
    assert.strictEqual(formatted, '');
  });
});
