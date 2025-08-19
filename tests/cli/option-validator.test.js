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
    assert.strictEqual(result.alwaysApply, null);
    assert.strictEqual(result.applyGlob, null);
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

  test('should handle exclude string with only whitespace', () => {
    const result = validateOptions({ exclude: '   ,  ,  ' });
    // Should return default exclude dirs when only whitespace
    assert.deepStrictEqual(result.excludeDirs, [
      'images', 'node_modules', 'dist', 'build', 'coverage', 'test', 'cjs', 'generator', 'lib', 'src'
    ]);
  });

  test('should handle null exclude string', () => {
    const result = validateOptions({ exclude: null });
    assert.deepStrictEqual(result.excludeDirs, [
      'images', 'node_modules', 'dist', 'build', 'coverage', 'test', 'cjs', 'generator', 'lib', 'src'
    ]);
  });

  test('should handle undefined exclude string', () => {
    const result = validateOptions({ exclude: undefined });
    assert.deepStrictEqual(result.excludeDirs, [
      'images', 'node_modules', 'dist', 'build', 'coverage', 'test', 'cjs', 'generator', 'lib', 'src'
    ]);
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

  test('should throw error for source URL without protocol', () => {
    assert.throws(() => {
      validateOptions({ sourceUrl: 'github.com/user/repo' });
    }, /Invalid source URL: github\.com\/user\/repo/);
  });

  test('should handle null source URL', () => {
    const result = validateOptions({ sourceUrl: null });
    assert.strictEqual(result.sourceUrl, null);
  });

  test('should handle undefined source URL', () => {
    const result = validateOptions({ sourceUrl: undefined });
    assert.strictEqual(result.sourceUrl, null);
  });

  test('should handle empty string source URL', () => {
    const result = validateOptions({ sourceUrl: '' });
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

  test('should validate and set alwaysApply option to true', () => {
    const result = validateOptions({ alwaysApply: true });
    assert.strictEqual(result.alwaysApply, true);
  });

  test('should validate and set alwaysApply option to false', () => {
    const result = validateOptions({ alwaysApply: false });
    assert.strictEqual(result.alwaysApply, false);
  });

  test('should validate and set applyGlob option', () => {
    const result = validateOptions({ applyGlob: '**/*.js' });
    assert.strictEqual(result.applyGlob, '**/*.js');
  });

  test('should trim applyGlob option', () => {
    const result = validateOptions({ applyGlob: '  **/*.js  ' });
    assert.strictEqual(result.applyGlob, '**/*.js');
  });

  test('should throw error for empty applyGlob', () => {
    assert.throws(() => {
      validateOptions({ applyGlob: '' });
    }, /Invalid apply-glob pattern: must be a non-empty string/);
  });

  test('should throw error for whitespace-only applyGlob', () => {
    assert.throws(() => {
      validateOptions({ applyGlob: '   ' });
    }, /Invalid apply-glob pattern: must be a non-empty string/);
  });

  test('should throw error for non-string applyGlob', () => {
    assert.throws(() => {
      validateOptions({ applyGlob: 123 });
    }, /Invalid apply-glob pattern: must be a non-empty string/);
  });

  test('should throw error when both alwaysApply and applyGlob are set', () => {
    assert.throws(() => {
      validateOptions({ alwaysApply: true, applyGlob: '**/*.js' });
    }, /Cannot use both --always-apply\/--no-always-apply and --apply-glob options together/);
  });

  test('should throw error when alwaysApply false and applyGlob are set', () => {
    assert.throws(() => {
      validateOptions({ alwaysApply: false, applyGlob: '**/*.js' });
    }, /Cannot use both --always-apply\/--no-always-apply and --apply-glob options together/);
  });

  test('should handle null alwaysApply with applyGlob', () => {
    const result = validateOptions({ applyGlob: '**/*.js' });
    assert.strictEqual(result.alwaysApply, null);
    assert.strictEqual(result.applyGlob, '**/*.js');
  });
});
