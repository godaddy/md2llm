/* eslint-disable max-len, max-statements */
import { test, describe, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const CLI_PATH = path.join(process.cwd(), 'bin', 'md2llm.js');

describe('CLI Integration', () => {
  let tempDir;
  let outputDir;
  let testFiles;

  before(() => {
    tempDir = 'temp-cli-test';
    outputDir = 'temp-cli-output';
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });
  });

  after(() => {
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Reset test files
    testFiles = {};
  });

  afterEach(() => {
    // Clean up test files
    Object.values(testFiles).forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  });

  // Helper function to create test files
  function createTestFile(filename, content) {
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, content);
    testFiles[filename] = filePath;
    return filePath;
  }

  // Helper function to run CLI and capture output
  function runCLI(args, expectSuccess = true) {
    const result = spawnSync('node', [CLI_PATH, ...args], {
      encoding: 'utf8',
      cwd: process.cwd()
    });

    if (expectSuccess && result.status !== 0) {
      console.error('STDOUT:', result.stdout);
      console.error('STDERR:', result.stderr);
    }

    return result;
  }

  // Helper function to check file exists and has content
  function assertFileExistsAndContains(filePath, expectedContent) {
    assert(fs.existsSync(filePath), `File should exist: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    if (Array.isArray(expectedContent)) {
      expectedContent.forEach(item => {
        assert(content.includes(item), `File should contain: ${item}`);
      });
    } else {
      assert(content.includes(expectedContent), `File should contain: ${expectedContent}`);
    }
  }

  describe('Basic Functionality', () => {
    test('should run CLI with basic markdown file', () => {
      createTestFile('README.md', '# Basic Test\n\nA simple test.\n\n```js\nconsole.log("test");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/basic', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assertFileExistsAndContains(
        path.join(outputDir, '@test', 'basic.md'),
        ['TITLE: Basic Test', 'console.log("test");', '@basic']
      );
    });

    test('should support mdc format', () => {
      createTestFile('README.md', '# MDC Test\n\nTest for MDC format.\n\n```js\nconst test = "mdc";\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/mdc', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir, '--format', 'mdc']);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assertFileExistsAndContains(
        path.join(outputDir, '@test', 'mdc.mdc'),
        ['---', 'description: mdc', 'alwaysApply: true', 'const test = "mdc";']
      );
    });

    test('should handle multiple source directories', () => {
      const dir1 = path.join(tempDir, 'dir1');
      const dir2 = path.join(tempDir, 'dir2');
      fs.mkdirSync(dir1, { recursive: true });
      fs.mkdirSync(dir2, { recursive: true });

      createTestFile('dir1/README.md', '# Dir1 Test\n\nTest from directory 1.\n\n```js\nconsole.log("dir1");\n```\n');
      createTestFile('dir1/package.json', JSON.stringify({ name: '@test/dir1', version: '1.0.0' }, null, 2));
      createTestFile('dir2/README.md', '# Dir2 Test\n\nTest from directory 2.\n\n```js\nconsole.log("dir2");\n```\n');
      createTestFile('dir2/package.json', JSON.stringify({ name: '@test/dir2', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, dir1, dir2]);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assertFileExistsAndContains(path.join(outputDir, '@test', 'dir1.md'), 'TITLE: Dir1 Test');
      assertFileExistsAndContains(path.join(outputDir, '@test', 'dir2.md'), 'TITLE: Dir2 Test');
    });
  });

  describe('CLI Options and Validation', () => {
    test('should validate format option', () => {
      createTestFile('README.md', '# Test\n\nTest content.\n\n```js\nconsole.log("test");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/format', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir, '--format', 'invalid'], false);

      assert.strictEqual(result.status, 1, 'CLI should exit with error');
      assert(result.stderr.includes('Invalid format: invalid'), 'Should show format error');
    });

    test('should handle exclude directories', () => {
      const excludedDir = path.join(tempDir, 'excluded');
      fs.mkdirSync(excludedDir, { recursive: true });

      createTestFile('README.md', '# Main Test\n\nMain content.\n\n```js\nconsole.log("main");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/exclude', version: '1.0.0' }, null, 2));
      createTestFile('excluded/README.md', '# Excluded Test\n\nThis should be excluded.\n\n```js\nconsole.log("excluded");\n```\n');
      createTestFile('excluded/package.json', JSON.stringify({ name: '@test/excluded', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir, '--exclude', 'excluded']);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assertFileExistsAndContains(path.join(outputDir, '@test', 'exclude.md'), 'TITLE: Main Test');
      assert(!fs.existsSync(path.join(outputDir, '@test', 'excluded.md')), 'Excluded file should not be created');
    });

    test('should handle source URL option', () => {
      createTestFile('README.md', '# Source URL Test\n\nTest with source URL.\n\n```js\nconsole.log("source");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/source', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir, '--source-url', 'https://github.com/user/repo/blob/main/']);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      // Source URL functionality would be tested in the output content
    });

    test('should validate source URL format', () => {
      createTestFile('README.md', '# Test\n\nTest content.\n\n```js\nconsole.log("test");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/url', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir, '--source-url', 'invalid-url'], false);

      assert.strictEqual(result.status, 1, 'CLI should exit with error');
      assert(result.stderr.includes('Invalid source URL'), 'Should show URL validation error');
    });

    test('should handle help flag', () => {
      const result = runCLI(['--help']);

      assert.strictEqual(result.status, 0, 'Help should exit successfully');
      assert(result.stdout.includes('md2llm'), 'Should show command name');
      assert(result.stdout.includes('A CLI tool for converting markdown to LLM rules'), 'Should show description');
    });

    test('should handle version flag', () => {
      const result = runCLI(['--version']);

      assert.strictEqual(result.status, 0, 'Version should exit successfully');
      assert(result.stdout.includes('1.0.0'), 'Should show version');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing destination directory', () => {
      const result = runCLI([], false);

      assert.strictEqual(result.status, 1, 'CLI should exit with error');
      assert(result.stderr.includes('error: missing required argument'), 'Should show missing argument error');
    });

    test('should handle missing source directories', () => {
      const result = runCLI([outputDir], false);

      assert.strictEqual(result.status, 1, 'CLI should exit with error');
      assert(result.stderr.includes('error: missing required argument'), 'Should show missing argument error');
    });

    test('should handle non-existent source directory gracefully', () => {
      const result = runCLI([outputDir, '/non/existent/path']);

      assert.strictEqual(result.status, 0, 'CLI should handle non-existent directory gracefully');
      assert(result.stdout.includes('Found 0 documentation files to process'), 'Should show no files found');
    });

    test('should handle read-only output directory', () => {
      // Make output directory read-only
      fs.chmodSync(outputDir, 0o444);

      createTestFile('README.md', '# Test\n\nTest content.\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/readonly', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir], false);

      // Restore permissions
      fs.chmodSync(outputDir, 0o755);

      assert.strictEqual(result.status, 1, 'CLI should exit with error');
      assert(result.stderr.includes('Error during conversion'), 'Should show conversion error');
    });

    test('should handle malformed package.json gracefully', () => {
      createTestFile('README.md', '# Test\n\nTest content.\n');
      createTestFile('package.json', 'invalid json content');

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should handle malformed package.json gracefully');
      assert(result.stdout.includes('Found 1 documentation files to process'), 'Should show files found but no snippets');
      assert(result.stdout.includes('No snippets found'), 'Should show no snippets found');
    });

    test('should handle missing package.json gracefully', () => {
      createTestFile('README.md', '# Test\n\nTest content.\n');
      // No package.json file

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should handle missing package.json gracefully');
      assert(result.stdout.includes('Found 1 documentation files to process'), 'Should show files found but no snippets');
      assert(result.stdout.includes('No snippets found'), 'Should show no snippets found');
    });

    test('should handle empty source directory', () => {
      const emptyDir = path.join(tempDir, 'empty');
      fs.mkdirSync(emptyDir, { recursive: true });

      const result = runCLI([outputDir, emptyDir]);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assert(result.stdout.includes('Found 0 documentation files to process'), 'Should show no files found');
    });

    test('should handle directory with no markdown files', () => {
      const noMdDir = path.join(tempDir, 'no-md');
      fs.mkdirSync(noMdDir, { recursive: true });
      createTestFile('no-md/package.json', JSON.stringify({ name: '@test/no-md', version: '1.0.0' }, null, 2));
      createTestFile('no-md/test.txt', 'This is not a markdown file');

      const result = runCLI([outputDir, noMdDir]);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assert(result.stdout.includes('Found 0 documentation files to process'), 'Should show no files found');
    });
  });

  describe('Edge Cases', () => {
    test('should handle files with special characters in names', () => {
      createTestFile('README.md', '# Special Chars Test\n\nTest with special characters.\n\n```js\nconsole.log("special");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/special-chars', version: '1.0.0' }, null, 2));
      createTestFile('test-file_with.dots.md', '# Test File\n\nFile with dots and underscores.\n\n```js\nconsole.log("dots");\n```\n');

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assertFileExistsAndContains(path.join(outputDir, '@test', 'special-chars.md'), 'TITLE: Special Chars Test');
    });

    test('should handle nested directory structures', () => {
      const nestedDir = path.join(tempDir, 'nested', 'deep', 'structure');
      fs.mkdirSync(nestedDir, { recursive: true });

      createTestFile('nested/deep/structure/README.md', '# Nested Test\n\nTest in nested directory.\n\n```js\nconsole.log("nested");\n```\n');
      createTestFile('nested/deep/structure/package.json', JSON.stringify({ name: '@test/nested', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, nestedDir]);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assertFileExistsAndContains(path.join(outputDir, '@test', 'nested.md'), 'TITLE: Nested Test');
    });

    test('should handle large markdown files', () => {
      const largeContent = '# Large Test\n\n' + 'A'.repeat(10000) + '\n\n```js\nconsole.log("large file");\n```\n';
      createTestFile('README.md', largeContent);
      createTestFile('package.json', JSON.stringify({ name: '@test/large', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should handle large files');
      assertFileExistsAndContains(path.join(outputDir, '@test', 'large.md'), 'TITLE: Large Test');
    });

    test('should handle many markdown files', () => {
      createTestFile('README.md', '# Main Test\n\nMain content.\n\n```js\nconsole.log("main");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/many', version: '1.0.0' }, null, 2));

      // Create many additional markdown files
      for (let i = 1; i <= 10; i++) {
        createTestFile(`file${i}.md`, `# File ${i}\n\nContent for file ${i}.\n\n\`\`\`js\nconsole.log("file${i}");\n\`\`\`\n`);
      }

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should handle many files');
      assertFileExistsAndContains(path.join(outputDir, '@test', 'many.md'), 'TITLE: Main Test');
    });

    test('should handle excluded file types', () => {
      createTestFile('README.md', '# Main Test\n\nMain content.\n\n```js\nconsole.log("main");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/excluded-files', version: '1.0.0' }, null, 2));
      createTestFile('CHANGELOG.md', '# Changelog\n\nThis should be excluded.\n\n```js\nconsole.log("changelog");\n```\n');
      createTestFile('LICENSE.md', '# License\n\nThis should be excluded.\n\n```js\nconsole.log("license");\n```\n');

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assertFileExistsAndContains(path.join(outputDir, '@test', 'excluded-files.md'), 'TITLE: Main Test');
      // Excluded files should not be processed
    });

    test('should handle package names with special characters', () => {
      createTestFile('README.md', '# Special Package Test\n\nTest with special package name.\n\n```js\nconsole.log("special");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/special-package-name', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      assertFileExistsAndContains(path.join(outputDir, '@test', 'special-package-name.md'), 'TITLE: Special Package Test');
    });
  });

  describe('Output Validation', () => {
    test('should generate correct MD format output', () => {
      createTestFile('README.md', '# MD Format Test\n\nTest MD format output.\n\n```js\nconst test = "md";\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/md-format', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir, '--format', 'md']);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      const outputFile = path.join(outputDir, '@test', 'md-format.md');
      assertFileExistsAndContains(outputFile, [
        'TITLE: MD Format Test',
        'const test = "md";',
        '@md-format'
      ]);
    });

    test('should generate correct MDC format output', () => {
      createTestFile('README.md', '# MDC Format Test\n\nTest MDC format output.\n\n```js\nconst test = "mdc";\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/mdc-format', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir, '--format', 'mdc']);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      const outputFile = path.join(outputDir, '@test', 'mdc-format.mdc');
      assertFileExistsAndContains(outputFile, [
        '---',
        'description: mdc-format',
        'alwaysApply: true',
        'const test = "mdc";'
      ]);
    });

    test('should handle source URL in output', () => {
      createTestFile('README.md', '# Source URL Output Test\n\nTest with source URL.\n\n```js\nconsole.log("source");\n```\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/source-output', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir, '--source-url', 'https://github.com/user/repo/blob/main/']);

      assert.strictEqual(result.status, 0, 'CLI should exit successfully');
      // Source URL functionality would be verified in the output content
    });
  });

  describe('Performance and Resource Usage', () => {
    test('should handle concurrent processing gracefully', () => {
      // Create multiple directories with files
      for (let i = 1; i <= 5; i++) {
        const dir = path.join(tempDir, `concurrent${i}`);
        fs.mkdirSync(dir, { recursive: true });
        createTestFile(`concurrent${i}/README.md`, `# Concurrent Test ${i}\n\nTest ${i} content.\n`);
        createTestFile(`concurrent${i}/package.json`, JSON.stringify({ name: `@test/concurrent${i}`, version: '1.0.0' }, null, 2));
      }

      const result = runCLI([outputDir, ...Array.from({ length: 5 }, (_, i) => path.join(tempDir, `concurrent${i + 1}`))]);

      assert.strictEqual(result.status, 0, 'CLI should handle concurrent processing');
    });

    test('should handle memory usage with large datasets', () => {
      // Create a large number of small files
      for (let i = 1; i <= 50; i++) {
        createTestFile(`large-dataset-${i}.md`, `# Dataset ${i}\n\nContent ${i}.\n`);
      }
      createTestFile('package.json', JSON.stringify({ name: '@test/large-dataset', version: '1.0.0' }, null, 2));

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should handle large datasets');
    });
  });

  describe('Cross-Platform Compatibility', () => {
    test('should handle Windows-style paths', () => {
      createTestFile('README.md', '# Windows Path Test\n\nTest with Windows paths.\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/windows', version: '1.0.0' }, null, 2));

      // Test with Windows-style path separators
      const windowsOutputDir = outputDir.replace(/\//g, '\\');
      const windowsTempDir = tempDir.replace(/\//g, '\\');

      const result = runCLI([windowsOutputDir, windowsTempDir]);

      assert.strictEqual(result.status, 0, 'CLI should handle Windows paths');
    });

    test('should handle Unicode file names', () => {
      createTestFile('README.md', '# Unicode Test\n\nTest with Unicode.\n');
      createTestFile('package.json', JSON.stringify({ name: '@test/unicode', version: '1.0.0' }, null, 2));
      createTestFile('测试文件.md', '# Unicode File Test\n\nTest with Unicode filename.\n');

      const result = runCLI([outputDir, tempDir]);

      assert.strictEqual(result.status, 0, 'CLI should handle Unicode filenames');
    });
  });
});
