import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const CLI_PATH = path.join(process.cwd(), 'index.js');

describe('CLI Integration', () => {
  let tempDir;
  let outputDir;

  before(() => {
    tempDir = path.join(process.cwd(), 'temp-cli-test');
    outputDir = path.join(process.cwd(), 'temp-cli-output');
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });
    // Create a markdown file
    fs.writeFileSync(
      path.join(tempDir, 'README.md'),
      '# CLI Test\n\nA test for the CLI.\n\n```js\nconsole.log("cli test");\n```\n'
    );
    // Create a package.json for package logic
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: '@cli/test', version: '1.0.0' }, null, 2)
    );
  });

  after(() => {
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
  });

  test('should run CLI and generate expected output', () => {
    // Run the CLI
    execFileSync('node', [CLI_PATH, outputDir, tempDir], { stdio: 'inherit' });
    // Check output file
    const outFile = path.join(outputDir, '@cli', 'test.md');
    assert(fs.existsSync(outFile), 'CLI should create the output file');
    const content = fs.readFileSync(outFile, 'utf8');
    assert(content.includes('TITLE: CLI Test'));
    assert(content.includes('console.log("cli test");'));
    assert(content.includes('@test'));
  });

  test('should support mdc format via CLI', () => {
    execFileSync('node', [CLI_PATH, outputDir, tempDir, '--format', 'mdc'], { stdio: 'inherit' });
    const outFile = path.join(outputDir, '@cli', 'test.mdc');
    assert(fs.existsSync(outFile), 'CLI should create the mdc output file');
    const content = fs.readFileSync(outFile, 'utf8');
    assert(content.includes('---'));
    assert(content.includes('description: test'));
    assert(content.includes('alwaysApply: true'));
    assert(content.includes('console.log("cli test");'));
  });
});
