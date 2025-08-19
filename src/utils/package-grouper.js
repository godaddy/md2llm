import fs from 'fs';
import path from 'path';
import { readPackageJson } from './source-url-manager.js';

/**
 * Package Grouper
 *
 * Groups markdown files by their package context to handle multiple files per package.
 */

/**
 * Groups markdown files by their package context
 * @param {string[]} markdownFiles - Array of markdown file paths
 * @returns {Object} Object with grouped files and standalone files
 */
export function groupFilesByPackage(markdownFiles) {
  const packageGroups = new Map();
  const standaloneFiles = [];

  for (const filePath of markdownFiles) {
    const packageContext = getPackageContext(filePath);

    if (packageContext) {
      const key = packageContext.packageJsonPath;
      if (!packageGroups.has(key)) {
        packageGroups.set(key, {
          packageInfo: packageContext,
          files: []
        });
      }
      packageGroups.get(key).files.push(filePath);
    } else {
      standaloneFiles.push(filePath);
    }
  }

  return {
    packageGroups: Array.from(packageGroups.values()),
    standaloneFiles
  };
}

/**
 * Gets package context for a markdown file
 * @param {string} filePath - Path to markdown file
 * @returns {Object|null} Package context or null if not in a package
 */
function getPackageContext(filePath) {
  const fileDir = path.dirname(filePath);

  // Look for package.json in the same directory as the markdown file
  const packageJsonPath = path.join(fileDir, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = readPackageJson(packageJsonPath);
    if (packageJson && packageJson.name) {
      return {
        packageJsonPath,
        packageJson,
        packageDir: fileDir
      };
    }
  }

  // Also check parent directories up to a reasonable depth
  return checkParentDirectories(fileDir, 3);
}

/**
 * Checks parent directories for package.json
 * @param {string} startDir - Starting directory
 * @param {number} maxDepth - Maximum depth to search
 * @returns {Object|null} Package context or null
 */
function checkParentDirectories(startDir, maxDepth) {
  let currentDir = startDir;
  let depth = 0;

  while (depth < maxDepth) {
    const parentDir = path.dirname(currentDir);

    // Stop if we've reached the root or can't go higher
    if (parentDir === currentDir) {
      break;
    }

    const packageJsonPath = path.join(parentDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = readPackageJson(packageJsonPath);
      if (packageJson && packageJson.name) {
        return {
          packageJsonPath,
          packageJson,
          packageDir: parentDir
        };
      }
    }

    currentDir = parentDir;
    depth++;
  }

  return null;
}

/**
 * Checks if a package has multiple markdown files
 * @param {Object} packageGroup - Package group object
 * @returns {boolean} True if package has multiple markdown files
 */
export function hasMultipleMarkdownFiles(packageGroup) {
  return packageGroup.files.length > 1;
}

/**
 * Gets the README.md file from a package group if it exists
 * @param {Object} packageGroup - Package group object
 * @returns {string|null} Path to README.md or null if not found
 */
export function getReadmeFile(packageGroup) {
  return packageGroup.files.find(file =>
    path.basename(file).toLowerCase() === 'readme.md'
  ) || null;
}

/**
 * Gets non-README markdown files from a package group
 * @param {Object} packageGroup - Package group object
 * @returns {string[]} Array of non-README markdown file paths
 */
export function getNonReadmeFiles(packageGroup) {
  return packageGroup.files.filter(file =>
    path.basename(file).toLowerCase() !== 'readme.md'
  );
}
