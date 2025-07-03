import fs from 'fs';
import { normalizePath, joinPaths, getPathSeparator } from './path-utils.js';

/**
 * Directory Manager
 *
 * Handles directory creation and path operations for the conversion process.
 * Manages output directory structure and ensures proper directory hierarchy.
 */

/**
 * Creates output directories for each package
 * @param {string} rulesDirPath - Base rules directory path
 * @param {string[]} packagesDirPaths - Array of package directory paths
 */
export function createOutputDirectories(rulesDirPath, packagesDirPaths) {
  if (!rulesDirPath || !packagesDirPaths || packagesDirPaths.length === 0) {
    throw new Error('Rules directory path and packages directory paths are required');
  }

  // Create base rules directory
  createDirectory(rulesDirPath);

  // Create package-specific directories
  packagesDirPaths.forEach(packageDirPath => {
    const scopedDir = extractPackageName(packageDirPath);
    const fullPath = joinPaths(rulesDirPath, scopedDir);
    createDirectory(fullPath);
  });
}

/**
 * Creates a directory recursively if it does not exist
 * @param {string} dirPath - Directory path to create
 * @returns {string} Created directory path
 * @throws {Error} If directory creation fails
 */
export function createDirectory(dirPath) {
  if (!dirPath) {
    throw new Error('Directory path is required');
  }

  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Extracts package name from directory path
 * @param {string} packageDirPath - Full path to package directory
 * @returns {string} Package name (last directory name)
 */
function extractPackageName(packageDirPath) {
  if (!packageDirPath) {
    return '';
  }

  // Handle both absolute and relative paths
  const normalizedPath = normalizePath(packageDirPath);
  const pathParts = normalizedPath.split(getPathSeparator());

  // Return the last non-empty part
  for (let i = pathParts.length - 1; i >= 0; i--) {
    if (pathParts[i]) {
      return pathParts[i];
    }
  }

  return '';
}

/**
 * Ensures a directory path exists, creating it if necessary
 * @param {string} dirPath - Directory path to ensure exists
 * @returns {string} Directory path that is guaranteed to exist
 */
export function ensureDirectoryExists(dirPath) {
  return createDirectory(dirPath);
}
