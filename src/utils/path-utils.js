import path from 'path';
import os from 'os';

/**
 * Path Utilities
 *
 * Cross-platform path handling utilities for Windows and Unix compatibility.
 */

/**
 * Normalizes a path for the current platform
 * @param {string} filePath - Path to normalize
 * @returns {string} Normalized path
 */
export function normalizePath(filePath) {
  if (!filePath) return '';
  return path.normalize(filePath);
}

/**
 * Joins path segments using platform-specific separator
 * @param {...string} segments - Path segments to join
 * @returns {string} Joined path
 */
export function joinPaths(...segments) {
  return path.join(...segments);
}

/**
 * Gets the platform-specific path separator
 * @returns {string} Path separator for current platform
 */
export function getPathSeparator() {
  return path.sep;
}

/**
 * Checks if the current platform is Windows
 * @returns {boolean} True if running on Windows
 */
export function isWindows() {
  return os.platform() === 'win32';
}

/**
 * Converts a path to use forward slashes (useful for URLs)
 * @param {string} filePath - Path to convert
 * @returns {string} Path with forward slashes
 */
export function toForwardSlashes(filePath) {
  return filePath.replace(/\\/g, '/');
}

/**
 * Converts a path to use platform-specific separators
 * @param {string} filePath - Path to convert
 * @returns {string} Path with platform-specific separators
 */
export function toPlatformSlashes(filePath) {
  return filePath.replace(/[/\\]/g, path.sep);
}

/**
 * Resolves a relative path to absolute using current working directory
 * @param {string} relativePath - Relative path to resolve
 * @returns {string} Absolute path
 */
export function resolvePath(relativePath) {
  return path.resolve(relativePath);
}

/**
 * Gets the directory name from a file path
 * @param {string} filePath - File path
 * @returns {string} Directory name
 */
export function getDirName(filePath) {
  return path.dirname(filePath);
}

/**
 * Gets the base name from a file path
 * @param {string} filePath - File path
 * @param {string} [ext] - Extension to remove
 * @returns {string} Base name
 */
export function getBaseName(filePath, ext) {
  return path.basename(filePath, ext);
}

/**
 * Gets the extension from a file path
 * @param {string} filePath - File path
 * @returns {string} File extension
 */
export function getExtension(filePath) {
  return path.extname(filePath);
}
