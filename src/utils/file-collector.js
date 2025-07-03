import fs from 'fs';
import path from 'path';

/**
 * File Collector
 *
 * Handles discovery and collection of markdown files from specified directories.
 * Implements recursive directory traversal with exclusion filtering.
 */

/**
 * Recursively collects all markdown files in given directories
 * @param {string[]} dirs - Directories or files to search
 * @param {string[]} excludeDirs - Directory names to exclude from search
 * @returns {string[]} Array of markdown file paths
 * @throws {Error} If directory access fails
 */
export function collectMarkdownFiles(dirs, excludeDirs = []) {
  if (!dirs || dirs.length === 0) {
    return [];
  }

  const results = [];
  const normalizedExcludeDirs = excludeDirs.map(dir => dir.toLowerCase());

  for (const dir of dirs) {
    const files = processDirectory(dir, normalizedExcludeDirs);
    results.push(...files);
  }

  return results;
}

/**
 * Processes a single directory or file
 * @param {string} dir - Directory or file path
 * @param {string[]} excludeDirs - Normalized exclude directories
 * @returns {string[]} Array of markdown file paths
 */
function processDirectory(dir, excludeDirs) {
  try {
    const stat = fs.statSync(dir);

    if (stat.isFile()) {
      return isMarkdownFile(dir) ? [dir] : [];
    }

    if (stat.isDirectory()) {
      return searchDirectory(dir, excludeDirs);
    }

    return [];
  } catch (error) {
    console.warn(`Warning: Could not access ${dir}: ${error.message}`);
    return [];
  }
}

/**
 * Searches a directory recursively for markdown files
 * @param {string} dirPath - Directory path to search
 * @param {string[]} excludeDirs - Lowercase directory names to exclude
 * @returns {string[]} Array of markdown file paths found in directory
 */
function searchDirectory(dirPath, excludeDirs) {
  const results = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (excludeDirs.includes(entry.name.toLowerCase())) {
          continue;
        }

        // Recursively search subdirectory
        const subResults = searchDirectory(fullPath, excludeDirs);
        results.push(...subResults);
      } else if (entry.isFile() && isMarkdownFile(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Log warning but continue processing other directories
    console.warn(`Warning: Could not read directory ${dirPath}: ${error.message}`);
  }

  return results;
}

/**
 * Checks if a file is a markdown file
 * @param {string} fileName - File name to check
 * @returns {boolean} True if file is a markdown file
 */
function isMarkdownFile(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    return false;
  }

  const lowerFileName = fileName.toLowerCase();
  return lowerFileName.endsWith('.md') || lowerFileName.endsWith('.markdown');
}

/**
 * Gets file statistics for a given path
 * @param {string} filePath - Path to get stats for
 * @returns {fs.Stats|null} File stats or null if file doesn't exist
 */
export function getFileStats(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    return null;
  }
}

/**
 * Checks if a path exists and is accessible
 * @param {string} filePath - Path to check
 * @returns {boolean} True if path exists and is accessible
 */
export function pathExists(filePath) {
  return getFileStats(filePath) != null;
}
