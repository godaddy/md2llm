import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { collectMarkdownFiles, getFileStats, pathExists } from '../../src/utils/file-collector.js';

describe('File Collector', () => {
  let tempDir;

  before(async () => {
    tempDir = 'temp-file-collector-test';
    fs.mkdirSync(tempDir, { recursive: true });

    // Create test files
    fs.writeFileSync(path.join(tempDir, 'test.md'), '# Test');
    fs.writeFileSync(path.join(tempDir, 'test.txt'), 'Not markdown');
    fs.writeFileSync(path.join(tempDir, 'test.MD'), '# Test uppercase');
    fs.writeFileSync(path.join(tempDir, 'test.markdown'), '# Test markdown');

    // Create subdirectory
    const subDir = path.join(tempDir, 'subdir');
    fs.mkdirSync(subDir, { recursive: true });
    fs.writeFileSync(path.join(subDir, 'nested.md'), '# Nested test');
  });

  after(async () => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should collect markdown files from directory', () => {
    const files = collectMarkdownFiles([tempDir], []);
    
    // Check that we get at least some markdown files
    assert(files.length > 0, 'Should collect markdown files');
    assert(files.some(f => f.includes('test.md')), 'Should include test.md');
    assert(files.some(f => f.includes('test.MD') || f.includes('test.md')), 'Should include test.md or test.MD');
    assert(files.some(f => f.includes('test.markdown')), 'Should include test.markdown');
    assert(files.some(f => f.includes('nested.md')), 'Should include nested.md');
  });

  test('should exclude specified directories', () => {
    const files = collectMarkdownFiles([tempDir], ['subdir']);
    
    assert(files.some(f => f.includes('test.md')), 'Should include test.md');
    assert(!files.some(f => f.includes('nested.md')), 'Should exclude nested.md');
  });

  test('should handle single file input', () => {
    const singleFile = path.join(tempDir, 'test.md');
    const files = collectMarkdownFiles([singleFile], []);
    
    assert(files.length === 1, 'Should return single file');
    assert(files[0].includes('test.md'), 'Should return the correct file');
  });

  test('should filter out non-markdown files', () => {
    const files = collectMarkdownFiles([tempDir], []);
    
    assert(!files.some(f => f.includes('test.txt')), 'Should exclude .txt files');
  });

  test('should handle empty directory list', () => {
    const files = collectMarkdownFiles([], []);
    assert.deepStrictEqual(files, [], 'Should return empty array');
  });

  test('should handle non-existent directory gracefully', () => {
    const files = collectMarkdownFiles(['non-existent-dir'], []);
    assert.deepStrictEqual(files, [], 'Should return empty array for non-existent directory');
  });

  test('should get file stats for existing file', () => {
    const testFile = path.join(tempDir, 'test.md');
    const stats = getFileStats(testFile);
    
    assert(stats !== null, 'Should return stats for existing file');
    assert(stats.isFile(), 'Should be a file');
  });

  test('should return null for non-existent file', () => {
    const stats = getFileStats('non-existent-file.md');
    assert.strictEqual(stats, null, 'Should return null for non-existent file');
  });

  test('should check if path exists', () => {
    const testFile = path.join(tempDir, 'test.md');
    const nonExistentFile = 'non-existent-file.md';
    
    assert(pathExists(testFile), 'Should return true for existing file');
    assert(!pathExists(nonExistentFile), 'Should return false for non-existent file');
  });

  test('should handle directory with no markdown files', () => {
    const emptyDir = path.join(tempDir, 'empty-dir');
    fs.mkdirSync(emptyDir, { recursive: true });
    
    const files = collectMarkdownFiles([emptyDir], []);
    assert.deepStrictEqual(files, [], 'Should return empty array for directory with no markdown files');
  });

  test('should handle mixed valid and invalid directories', () => {
    const validDir = tempDir;
    const invalidDir = 'non-existent-dir';
    
    const files = collectMarkdownFiles([validDir, invalidDir], []);
    
    assert(files.length > 0, 'Should collect files from valid directory');
    assert(files.some(f => f.includes('test.md')), 'Should include files from valid directory');
  });
});
