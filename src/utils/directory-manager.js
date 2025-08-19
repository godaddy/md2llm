import fs from 'fs';

/**
 * Directory Manager
 *
 * Handles directory creation and path operations for the conversion process.
 * Manages output directory structure and ensures proper directory hierarchy.
 */



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
 * Ensures a directory path exists, creating it if necessary
 * @param {string} dirPath - Directory path to ensure exists
 * @returns {string} Directory path that is guaranteed to exist
 */
export function ensureDirectoryExists(dirPath) {
  return createDirectory(dirPath);
}
