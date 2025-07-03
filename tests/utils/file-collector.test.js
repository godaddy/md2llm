import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { collectMarkdownFiles, getFileStats, pathExists } from '../../src/utils/file-collector.js';

describe('File Collector', () => {
  let tempDir;

  before(async () => {
    // Create temporary test directory structure
    tempDir = 'temp-test-dir';
    fs.mkdirSync(tempDir, { recursive: true });

    // Create test files and directories
    fs.mkdirSync(path.join(tempDir, 'docs'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, 'node_modules'), { recursive: true });

    // Create markdown files
    fs.writeFileSync(path.join(tempDir, 'docs', 'README.md'), '# Test README');
    fs.writeFileSync(path.join(tempDir, 'docs', 'guide.md'), '# Test Guide');
    fs.writeFileSync(path.join(tempDir, 'src', 'api.md'), '# API Docs');

    // Create non-markdown files
    fs.writeFileSync(path.join(tempDir, 'docs', 'config.json'), '{}');
    fs.writeFileSync(path.join(tempDir, 'src', 'index.js'), 'console.log("test");');
  });

  after(async () => {
    // Clean up test directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should collect markdown files from directory', () => {
    const files = collectMarkdownFiles([tempDir], []);

    assert.strictEqual(files.length, 3);
    assert(files.some(f => f.includes('README.md')));
    assert(files.some(f => f.includes('guide.md')));
    assert(files.some(f => f.includes('api.md')));
  });

  test('should exclude specified directories', () => {
    const files = collectMarkdownFiles([tempDir], ['node_modules']);

    assert.strictEqual(files.length, 3);
    // Should not include any files from node_modules
    assert(!files.some(f => f.includes('node_modules')));
  });

  test('should handle single file input', () => {
    const singleFile = path.join(tempDir, 'docs', 'README.md');
    const files = collectMarkdownFiles([singleFile], []);

    assert.strictEqual(files.length, 1);
    assert(files[0].includes('README.md'));
  });

  test('should filter out non-markdown files', () => {
    const files = collectMarkdownFiles([tempDir], []);

    // Should not include .json or .js files
    assert(!files.some(f => f.endsWith('.json')));
    assert(!files.some(f => f.endsWith('.js')));
  });

  test('should handle empty directory list', () => {
    const files = collectMarkdownFiles([], []);
    assert.deepStrictEqual(files, []);
  });

  test('should handle non-existent directory gracefully', () => {
    const files = collectMarkdownFiles(['non-existent-dir'], []);
    assert.deepStrictEqual(files, []);
  });

  test('should get file stats for existing file', () => {
    const filePath = path.join(tempDir, 'docs', 'README.md');
    const stats = getFileStats(filePath);

    assert(stats != null);
    assert(stats.isFile());
  });

  test('should return null for non-existent file', () => {
    const stats = getFileStats('non-existent-file');
    assert.strictEqual(stats, null);
  });

  test('should check if path exists', () => {
    const existingPath = path.join(tempDir, 'docs', 'README.md');
    const nonExistentPath = 'non-existent-file';

    assert.strictEqual(pathExists(existingPath), true);
    assert.strictEqual(pathExists(nonExistentPath), false);
  });
});
