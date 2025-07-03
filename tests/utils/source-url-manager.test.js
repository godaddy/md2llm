import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getScopeAndName, readPackageJson } from '../../src/utils/source-url-manager.js';

describe('Source URL Manager', () => {
  test('should parse scoped package names correctly', () => {
    const result = getScopeAndName('@test/package-name');
    assert.strictEqual(result.scope, '@test');
    assert.strictEqual(result.name, 'package-name');
  });

  test('should parse unscoped package names correctly', () => {
    const result = getScopeAndName('package-name');
    assert.strictEqual(result.scope, null);
    assert.strictEqual(result.name, 'package-name');
  });

  test('should handle null package name', () => {
    const result = getScopeAndName(null);
    assert.strictEqual(result.scope, null);
    assert.strictEqual(result.name, '');
  });

  test('should handle undefined package name', () => {
    const result = getScopeAndName(undefined);
    assert.strictEqual(result.scope, null);
    assert.strictEqual(result.name, '');
  });

  test('should handle empty string package name', () => {
    const result = getScopeAndName('');
    assert.strictEqual(result.scope, null);
    assert.strictEqual(result.name, '');
  });

  test('should return null for non-existent package.json', () => {
    const result = readPackageJson('non-existent-package.json');
    assert.strictEqual(result, null);
  });
}); 
