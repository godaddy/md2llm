import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateOptions } from '../../src/cli/option-validator.js';

describe('Option Validator', () => {
  test('should return default options when no options provided', () => {
    const result = validateOptions({});

    assert.strictEqual(result.format, 'md');
    assert.deepStrictEqual(result.excludeDirs, [
      'images', 'node_modules', 'dist', 'build', 'coverage', 'test', 'cjs', 'generator', 'lib', 'src'
    ]);
    assert.strictEqual(result.sourceUrl, null);
  });

  test('should validate and set format option', () => {
    const result = validateOptions({ format: 'mdc' });
    assert.strictEqual(result.format, 'mdc');
  });

  test('should throw error for invalid format', () => {
    assert.throws(() => {
      validateOptions({ format: 'invalid' });
    }, /Invalid format: invalid/);
  });

  test('should parse exclude directories string', () => {
    const result = validateOptions({ exclude: 'test,dist,coverage' });
    assert.deepStrictEqual(result.excludeDirs, ['test', 'dist', 'coverage']);
  });

  test('should handle empty exclude string', () => {
    const result = validateOptions({ exclude: '' });
    // Empty string should return default exclude dirs
    assert.deepStrictEqual(result.excludeDirs, [
      'images', 'node_modules', 'dist', 'build', 'coverage', 'test', 'cjs', 'generator', 'lib', 'src'
    ]);
  });

  test('should handle exclude string with spaces', () => {
    const result = validateOptions({ exclude: ' test , dist , coverage ' });
    assert.deepStrictEqual(result.excludeDirs, ['test', 'dist', 'coverage']);
  });

  test('should validate and set source URL', () => {
    const result = validateOptions({ sourceUrl: 'https://github.com/user/repo/blob/main/' });
    assert.strictEqual(result.sourceUrl, 'https://github.com/user/repo/blob/main/');
  });

  test('should add trailing slash to source URL', () => {
    const result = validateOptions({ sourceUrl: 'https://github.com/user/repo/blob/main' });
    assert.strictEqual(result.sourceUrl, 'https://github.com/user/repo/blob/main/');
  });

  test('should throw error for invalid source URL', () => {
    assert.throws(() => {
      validateOptions({ sourceUrl: 'not-a-url' });
    }, /Invalid source URL: not-a-url/);
  });

  test('should handle null source URL', () => {
    const result = validateOptions({ sourceUrl: null });
    assert.strictEqual(result.sourceUrl, null);
  });

  test('should combine multiple options correctly', () => {
    const result = validateOptions({
      format: 'mdc',
      exclude: 'test,dist',
      sourceUrl: 'https://github.com/user/repo/blob/main/'
    });

    assert.strictEqual(result.format, 'mdc');
    assert.deepStrictEqual(result.excludeDirs, ['test', 'dist']);
    assert.strictEqual(result.sourceUrl, 'https://github.com/user/repo/blob/main/');
  });
});
