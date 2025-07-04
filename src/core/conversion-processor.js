import { createOutputDirectories } from '../utils/directory-manager.js';
import { collectMarkdownFiles } from '../utils/file-collector.js';
import { processMarkdownFile } from '../processors/markdown-processor.js';

/**
 * Conversion Processor
 *
 * Main orchestrator for the markdown to LLM rules conversion process.
 * Coordinates file collection, directory creation, and file processing.
 */

/**
 * Processes the conversion of markdown files to LLM rules
 * @param {string} rulesDirPath - Path to rules output directory
 * @param {string|string[]} packagesDirPaths - Path(s) to package directory(ies) to scan
 * @param {Object} options - Conversion options
 * @param {string} options.format - Output format ('md' or 'mdc')
 * @param {string[]} options.excludeDirs - Directories to exclude from processing
 */
export function processConversion(rulesDirPath, packagesDirPaths, options) {
  if (!rulesDirPath || !packagesDirPaths) {
    throw new Error('Rules directory path and packages directory paths are required');
  }

  console.log('Starting conversion process...');

  // Normalize packagesDirPaths to array
  const paths = Array.isArray(packagesDirPaths) ? packagesDirPaths : [packagesDirPaths];

  // Create output directories for each package
  createOutputDirectories(rulesDirPath, paths);

  // Collect and filter markdown files
  const filteredFiles = getFilteredFiles(paths, options.excludeDirs);
  console.log(`Found ${filteredFiles.length} documentation files to process`);

  // Process files and get results
  const results = processFiles(filteredFiles, rulesDirPath, options.format);

  // Log completion summary
  logCompletionSummary(results, rulesDirPath);
}

/**
 * Gets filtered markdown files from paths
 * @param {string[]} paths - Package directory paths
 * @param {string[]} excludeDirs - Directories to exclude
 * @returns {string[]} Filtered markdown files
 */
function getFilteredFiles(paths, excludeDirs) {
  const markdownFiles = collectMarkdownFiles(paths, excludeDirs);
  return filterDocumentationFiles(markdownFiles);
}

/**
 * Processes markdown files and returns results
 * @param {string[]} files - Files to process
 * @param {string} rulesDirPath - Output directory
 * @param {string} format - Output format
 * @returns {Object} Processing results
 */
function processFiles(files, rulesDirPath, format) {
  let processedCount = 0;
  let errorCount = 0;

  for (const filePath of files) {
    try {
      processMarkdownFile(filePath, rulesDirPath, format);
      processedCount++;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      errorCount++;
    }
  }

  return { processedCount, errorCount };
}

/**
 * Logs completion summary
 * @param {Object} results - Processing results
 * @param {string} rulesDirPath - Output directory
 */
function logCompletionSummary(results, rulesDirPath) {
  console.log(`\nConversion completed:`);
  console.log(`  - Files processed: ${results.processedCount}`);
  console.log(`  - Errors: ${results.errorCount}`);
  console.log(`  - Output directory: ${rulesDirPath}`);
}

/**
 * Filters out common non-documentation markdown files
 * @param {string[]} markdownFiles - Array of markdown file paths
 * @returns {string[]} Filtered array containing only documentation files
 */
function filterDocumentationFiles(markdownFiles) {
  const excludedFiles = [
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md',
    'SECURITY.md',
    'LICENSE.md'
  ];

  return markdownFiles.filter(filePath => {
    const fileName = filePath.split('/').pop();
    return !excludedFiles.includes(fileName);
  });
}
