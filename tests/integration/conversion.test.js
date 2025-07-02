import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { processConversion } from '../../src/core/conversion-processor.js';

describe('Integration Tests', () => {
  let tempDir;
  let outputDir;

  before(async () => {
    // Create temporary test directories
    tempDir = path.join(process.cwd(), 'temp-integration-test');
    outputDir = path.join(process.cwd(), 'temp-output-test');

    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });

    // Create test markdown files
    const testMarkdown = `# Test Documentation

This is a test description.

\`\`\`javascript
function test() {
  console.log("Hello, World!");
}
\`\`\`

## Another Section

More description here.

\`\`\`python
def hello():
    print("Hello from Python!")
\`\`\`

## Configuration

\`\`\`json
{
  "name": "test-project",
  "version": "1.0.0"
}
\`\`\``;

    fs.writeFileSync(path.join(tempDir, 'README.md'), testMarkdown);

    // Create a package.json for package testing
    const packageJson = {
      name: '@test/package',
      version: '1.0.0',
      description: 'Test package'
    };
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  });

  after(async () => {
    // Clean up test directories
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  test('should process markdown files and generate md output', async () => {
    const options = {
      format: 'md',
      excludeDirs: ['node_modules']
    };

    processConversion(outputDir, [tempDir], options);

    // Check that output file was created with package name (from package.json)
    const outputFile = path.join(outputDir, '@test', 'package.md');
    assert(fs.existsSync(outputFile), 'Output file should exist');

    const content = fs.readFileSync(outputFile, 'utf8');

    // Check for expected content
    assert(content.includes('TITLE: Test Documentation'));
    assert(content.includes('TITLE: Another Section'));
    assert(content.includes('TITLE: Configuration'));
    assert(content.includes('function test()'));
    assert(content.includes('def hello():'));
    assert(content.includes('"name": "test-project"'));
    assert(content.includes('@package'));
  });

  test('should process markdown files and generate mdc output', async () => {
    const options = {
      format: 'mdc',
      excludeDirs: ['node_modules']
    };

    processConversion(outputDir, [tempDir], options);

    // Check that output file was created with package name (from package.json)
    const outputFile = path.join(outputDir, '@test', 'package.mdc');
    assert(fs.existsSync(outputFile), 'Output file should exist');

    const content = fs.readFileSync(outputFile, 'utf8');

    // Check for frontmatter
    assert(content.includes('---'));
    assert(content.includes('description: package'));
    assert(content.includes('alwaysApply: true'));

    // Check for expected content
    assert(content.includes('TITLE: Test Documentation'));
    assert(content.includes('@package'));
  });

  test('should handle package-specific logic for README.md', async () => {
    const options = {
      format: 'md',
      excludeDirs: ['node_modules']
    };

    processConversion(outputDir, [tempDir], options);

    // Check that output file was created with package name in scoped directory
    const outputFile = path.join(outputDir, '@test', 'package.md');
    assert(fs.existsSync(outputFile), 'Output file should exist with package name');

    const content = fs.readFileSync(outputFile, 'utf8');
    assert(content.includes('@package'));
  });

  test('should handle multiple input directories', async () => {
    // Create second test directory
    const tempDir2 = path.join(process.cwd(), 'temp-integration-test-2');
    fs.mkdirSync(tempDir2, { recursive: true });

    const testMarkdown2 = `# Second Test

\`\`\`bash
echo "Hello from second test"
\`\`\``;

    fs.writeFileSync(path.join(tempDir2, 'test2.md'), testMarkdown2);

    const options = {
      format: 'md',
      excludeDirs: ['node_modules']
    };

    processConversion(outputDir, [tempDir, tempDir2], options);

    // Check that both output files were created
    const outputFile1 = path.join(outputDir, '@test', 'package.md');
    const outputFile2 = path.join(outputDir, 'test2.md');

    assert(fs.existsSync(outputFile1), 'First output file should exist');
    assert(fs.existsSync(outputFile2), 'Second output file should exist');

    // Clean up second test directory
    fs.rmSync(tempDir2, { recursive: true, force: true });
  });

  test('should exclude specified directories', async () => {
    // Create excluded directory with markdown file
    const excludedDir = path.join(tempDir, 'node_modules');
    fs.mkdirSync(excludedDir, { recursive: true });
    fs.writeFileSync(path.join(excludedDir, 'excluded.md'), '# Excluded File');

    const options = {
      format: 'md',
      excludeDirs: ['node_modules']
    };

    processConversion(outputDir, [tempDir], options);

    // Check that excluded file was not processed
    const outputFile = path.join(outputDir, '@test', 'package.md');
    const content = fs.readFileSync(outputFile, 'utf8');

    assert(!content.includes('Excluded File'), 'Excluded file should not be processed');
  });

  test('should handle files without code snippets', async () => {
    const noSnippetsFile = path.join(tempDir, 'no-snippets.md');
    fs.writeFileSync(noSnippetsFile, '# No Code Snippets\n\nJust some text here.');

    const options = {
      format: 'md',
      excludeDirs: ['node_modules']
    };

    // Should not throw error
    processConversion(outputDir, [tempDir], options);

    // Check that no output file was created for file without snippets
    const outputFile = path.join(outputDir, 'no-snippets.md');
    assert(!fs.existsSync(outputFile), 'No output file should be created for file without snippets');
  });
});
