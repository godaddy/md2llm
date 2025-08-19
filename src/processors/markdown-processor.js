import fs from 'fs';
import path from 'path';
import markdownIt from 'markdown-it';
import { getSourceUrl, getScopeAndName, readPackageJson } from '../utils/source-url-manager.js';
import { createDirectory } from '../utils/directory-manager.js';
import { generateOutputContent } from '../formatters/output-formatter.js';
import { extractSnippetsFromTokens } from './snippet-extractor.js';
import { hasMultipleMarkdownFiles, getReadmeFile, getNonReadmeFiles } from '../utils/package-grouper.js';

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
 * @param {string|Object} formatOrOptions - Output format ('md' or 'mdc') or options object
 */
export function processMarkdownFile(filePath, rulesDir, formatOrOptions = 'md') {
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

  // Normalize format and options
  const options = normalizeFormatOrOptions(formatOrOptions);
  const format = options.format;

  // Determine output file information
  const outputInfo = determineOutputInfo(filePath, rulesDir, format);

  // Generate output content with options
  const outputContent = generateOutputContent(snippets, outputInfo, format, options);

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

/**
 * Processes multiple markdown files from a package
 * @param {Object} packageGroup - Package group containing multiple files
 * @param {string} rulesDir - Output directory for generated files
 * @param {string|Object} formatOrOptions - Output format ('md' or 'mdc') or options object
 */
export function processPackageMarkdownFiles(packageGroup, rulesDir, formatOrOptions = 'md') {
  if (!packageGroup || !rulesDir) {
    throw new Error('Package group and rules directory are required');
  }

  const { packageInfo, files } = packageGroup;
  const packageJson = packageInfo.packageJson;

  // Normalize format and options
  const options = normalizeFormatOrOptions(formatOrOptions);
  const format = options.format;

  // If only one file (README.md), use existing single-file logic
  if (!hasMultipleMarkdownFiles(packageGroup)) {
    const singleFile = files[0];
    processMarkdownFile(singleFile, rulesDir, options);
    return;
  }

  // Multiple files - create directory structure
  console.log(`Processing ${files.length} markdown files for package ${packageJson.name}`);

  // Determine package output directory
  const packageOutputInfo = determinePackageOutputInfo(packageJson, rulesDir, format);
  createDirectory(packageOutputInfo.packageDir);

  // Process each file in the package
  let totalSnippets = 0;
  for (const filePath of files) {
    const snippetCount = processFileInPackageDirectory(filePath, packageOutputInfo, options);
    totalSnippets += snippetCount;
  }

  console.log(`Wrote ${totalSnippets} total snippets for package ${packageJson.name} to ${packageOutputInfo.packageDir}`);
}

/**
 * Determines output directory information for a package with multiple files
 * @param {Object} packageJson - Package.json content
 * @param {string} rulesDir - Base rules directory
 * @param {string} format - Output format
 * @returns {Object} Package output information
 */
function determinePackageOutputInfo(packageJson, rulesDir, format) {
  const packageInfo = getScopeAndName(packageJson.name);
  let packageDir = rulesDir;

  if (packageInfo.scope) {
    packageDir = path.join(rulesDir, packageInfo.scope, packageInfo.name);
  } else {
    packageDir = path.join(rulesDir, packageInfo.name);
  }

  return {
    packageDir,
    packageName: packageInfo.name,
    packageScope: packageInfo.scope,
    format
  };
}

/**
 * Processes a single file within a package directory structure
 * @param {string} filePath - Path to markdown file
 * @param {Object} packageOutputInfo - Package output information
 * @param {string|Object} formatOrOptions - Output format or options object
 * @returns {number} Number of snippets processed
 */
function processFileInPackageDirectory(filePath, packageOutputInfo, formatOrOptions) {
  // Read and parse markdown file
  const markdownContent = readMarkdownFile(filePath);
  const tokens = md.parse(markdownContent, {});

  // Extract snippets from parsed tokens
  const snippets = extractSnippetsFromTokens(tokens, filePath);

  if (snippets.length === 0) {
    console.log(`No snippets found in ${filePath}`);
    return 0;
  }

  // Normalize format and options
  const options = normalizeFormatOrOptions(formatOrOptions);
  const format = options.format;

  // Determine output file name based on original file
  const fileNameWithoutExt = path.basename(filePath, '.md');
  const outputExt = format === 'mdc' ? '.mdc' : '.md';
  const outputFileName = `${fileNameWithoutExt}${outputExt}`;
  const outputPath = path.join(packageOutputInfo.packageDir, outputFileName);

  const outputInfo = {
    outputPath,
    outputDir: packageOutputInfo.packageDir,
    outputFileName: fileNameWithoutExt,
    atTag: fileNameWithoutExt,
    source: getSourceUrl(filePath)
  };

  // Generate and write output content with options
  const outputContent = generateOutputContent(snippets, outputInfo, format, options);
  writeOutputFile(outputPath, outputContent);

  console.log(`  Wrote ${snippets.length} snippets from ${path.basename(filePath)} to ${outputFileName}`);
  return snippets.length;
}

/**
 * Normalizes format or options parameter to a consistent options object
 * @param {string|Object} formatOrOptions - Format string or options object
 * @returns {Object} Normalized options object
 */
function normalizeFormatOrOptions(formatOrOptions) {
  if (typeof formatOrOptions === 'string') {
    return { format: formatOrOptions };
  }

  if (typeof formatOrOptions === 'object' && formatOrOptions !== null) {
    return {
      format: formatOrOptions.format || 'md',
      alwaysApply: formatOrOptions.alwaysApply,
      applyGlob: formatOrOptions.applyGlob
    };
  }

  return { format: 'md' };
}
