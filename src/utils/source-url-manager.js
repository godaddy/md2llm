import fs from 'fs';
import path from 'path';

/**
 * Source URL Manager
 * 
 * Handles generation of source URLs for files and extraction of package information.
 * Manages both custom source URLs and automatic package repository detection.
 */

const repoRoot = process.cwd();

/**
 * Gets the source URL for a given file path
 * @param {string} filePath - Path to the file
 * @returns {string} Source URL for the file
 */
export function getSourceUrl(filePath) {
  if (!filePath) {
    return '';
  }

  // Use custom source URL if provided via environment variable
  const customBaseUrl = process.env.SOURCE_BASE_URL;
  if (customBaseUrl) {
    const relativePath = getRelativePath(filePath);
    return `${customBaseUrl}${relativePath}`;
  }

  // Handle node_modules packages
  const nodeModulesUrl = getNodeModulesSourceUrl(filePath);
  if (nodeModulesUrl) {
    return nodeModulesUrl;
  }

  // Default to relative path
  return getRelativePath(filePath);
}

/**
 * Gets the relative path from repository root
 * @param {string} filePath - Absolute file path
 * @returns {string} Relative path from repo root
 */
function getRelativePath(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

/**
 * Gets source URL for files in node_modules
 * @param {string} filePath - Path to the file
 * @returns {string|null} Source URL or null if not a node_modules file
 */
function getNodeModulesSourceUrl(filePath) {
  const relativePath = getRelativePath(filePath);
  const nodeModulesMatch = relativePath.match(/^node_modules\/(@[^/]+\/[^/]+|[^/]+)\/(.*)$/);
  
  if (!nodeModulesMatch) {
    return null;
  }

  const packageName = nodeModulesMatch[1];
  const packageDir = path.join(repoRoot, 'node_modules', packageName);
  const packageJsonPath = path.join(packageDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Return homepage if available
    if (packageJson.homepage) {
      return packageJson.homepage;
    }

    // Fallback to repository URL
    if (packageJson.repository) {
      const repoUrl = extractRepositoryUrl(packageJson.repository);
      if (repoUrl) {
        return repoUrl;
      }
    }
  } catch (error) {
    // Silently fall back to relative path
  }

  return null;
}

/**
 * Extracts repository URL from package.json repository field
 * @param {string|Object} repository - Repository field from package.json
 * @returns {string|null} Repository URL or null if invalid
 */
function extractRepositoryUrl(repository) {
  if (!repository) {
    return null;
  }

  if (typeof repository === 'string') {
    return repository;
  }

  if (typeof repository === 'object' && repository.url) {
    return repository.url;
  }

  return null;
}

/**
 * Parses NPM package name into scope and unscoped name
 * @param {string} pkgName - Package name to parse
 * @returns {Object} Object with scope and name properties
 */
export function getScopeAndName(pkgName) {
  if (!pkgName || typeof pkgName !== 'string') {
    return { scope: null, name: '' };
  }

  const match = pkgName.match(/^(@[^/]+)\/(.+)$/);
  if (match) {
    return { scope: match[1], name: match[2] };
  }

  return { scope: null, name: pkgName };
}

/**
 * Reads package.json file and returns parsed content
 * @param {string} packageJsonPath - Path to package.json file
 * @returns {Object|null} Parsed package.json or null if error
 */
export function readPackageJson(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
} 
