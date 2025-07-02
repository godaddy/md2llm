import fs from 'fs';
import path from 'path';
import markdownIt from 'markdown-it';
import { getSourceUrl, getScopeAndName, readPackageJson } from '../utils/source-url-manager.js';
import { createDirectory } from '../utils/directory-manager.js';
import { generateOutputContent } from '../formatters/output-formatter.js';
import { extractSnippetsFromTokens } from './snippet-extractor.js';

/**
 * Markdown Processor
 *
 * Main processor for converting markdown files to LLM rules.
 * Handles file parsing, snippet extraction, and output generation.
 */

const md = markdownIt();

/**
 * Processes a markdown file and generates LLM rules output
 * @param {string} filePath - Path to markdown file
 * @param {string} rulesDir - Output directory for generated files
 * @param {string} format - Output format ('md' or 'mdc')
 */
export function processMarkdownFile(filePath, rulesDir, format = 'md') {
  if (!filePath || !rulesDir) {
    throw new Error('File path and rules directory are required');
  }

  // Read and parse markdown file
  const markdownContent = readMarkdownFile(filePath);
  const tokens = md.parse(markdownContent, {});

  // Extract snippets from parsed tokens
  const snippets = extractSnippetsFromTokens(tokens, filePath);

  if (snippets.length === 0) {
    console.log(`No snippets found in ${filePath}`);
    return;
  }

  // Determine output file information
  const outputInfo = determineOutputInfo(filePath, rulesDir, format);

  // Generate output content
  const outputContent = generateOutputContent(snippets, outputInfo, format);

  // Write output file
  writeOutputFile(outputInfo.outputPath, outputContent);

  console.log(`Wrote ${snippets.length} snippets to ${outputInfo.outputPath}`);
}

/**
 * Reads markdown file content
 * @param {string} filePath - Path to markdown file
 * @returns {string} File content
 * @throws {Error} If file cannot be read
 */
function readMarkdownFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read markdown file ${filePath}: ${error.message}`);
  }
}

/**
 * Determines output file information based on input file and package context
 * @param {string} filePath - Input markdown file path
 * @param {string} rulesDir - Base rules directory
 * @param {string} format - Output format
 * @returns {Object} Output file information
 */
function determineOutputInfo(filePath, rulesDir, format) {
  const fileNameWithoutExt = path.basename(filePath, '.md');
  let outputFileName = fileNameWithoutExt;
  let outputDir = rulesDir;
  let atTag = fileNameWithoutExt;

  // Special handling for package README.md files
  if (isPackageReadme(filePath)) {
    const packageInfo = extractPackageInfo(filePath);
    if (packageInfo) {
      outputFileName = packageInfo.name;
      atTag = packageInfo.name;

      if (packageInfo.scope) {
        outputDir = path.join(rulesDir, packageInfo.scope);
        createDirectory(outputDir);
      }
    }
  }

  const outputExt = format === 'mdc' ? '.mdc' : '.md';
  const outputPath = path.join(outputDir, `${outputFileName}${outputExt}`);

  return {
    outputPath,
    outputDir,
    outputFileName,
    atTag,
    source: getSourceUrl(filePath)
  };
}

/**
 * Checks if file is a package README.md
 * @param {string} filePath - File path to check
 * @returns {boolean} True if file is a package README.md
 */
function isPackageReadme(filePath) {
  return path.basename(filePath) === 'README.md';
}

/**
 * Extracts package information from package.json
 * @param {string} filePath - Path to README.md file
 * @returns {Object|null} Package information or null if not found
 */
function extractPackageInfo(filePath) {
  const packageDir = path.dirname(filePath);
  const packageJsonPath = path.join(packageDir, 'package.json');

  const packageJson = readPackageJson(packageJsonPath);
  if (!packageJson || !packageJson.name) {
    return null;
  }

  return getScopeAndName(packageJson.name);
}

/**
 * Writes output content to file
 * @param {string} outputPath - Path to output file
 * @param {string} content - Content to write
 * @throws {Error} If file cannot be written
 */
function writeOutputFile(outputPath, content) {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    createDirectory(outputDir);

    fs.writeFileSync(outputPath, content);
  } catch (error) {
    throw new Error(`Failed to write output file ${outputPath}: ${error.message}`);
  }
}
