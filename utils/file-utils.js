import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();

/**
 * Create a directory recursively if it does not exist.
 * @param {string} dir - Directory path
 * @returns {string|undefined}
 */
export function createDir(dir) {
  if (!dir) return;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Get the source URL for a given file path, always relative to the repo root.
 * @param {string} filePath - Path to the file
 * @returns {string} Source URL
 */
export function getSourceUrl(filePath) {
  const relToRepo = path.relative(repoRoot, filePath).replace(/\\/g, '/');

  // Use custom source URL if provided
  const customBaseUrl = process.env.SOURCE_BASE_URL;
  if (customBaseUrl) {
    return `${customBaseUrl}${relToRepo}`;
  }

  // Handle node_modules packages
  const nodeModulesUrl = getNodeModulesUrl(relToRepo);
  if (nodeModulesUrl) {
    return nodeModulesUrl;
  }

  return relToRepo;
}

/**
 * Gets URL for node_modules packages
 * @param {string} relToRepo - Relative path to repo
 * @returns {string|null} Package URL or null
 */
function getNodeModulesUrl(relToRepo) {
  const nodeModulesMatch = relToRepo.match(/^node_modules\/(@[^/]+\/[^/]+|[^/]+)\/(.*)$/);
  if (!nodeModulesMatch) {
    return null;
  }

  const packageName = nodeModulesMatch[1];
  const packageDir = path.join(repoRoot, 'node_modules', packageName);
  const packageJsonPath = path.join(packageDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  return getPackageUrl(packageJsonPath);
}

/**
 * Gets URL from package.json
 * @param {string} packageJsonPath - Path to package.json
 * @returns {string|null} Package URL or null
 */
function getPackageUrl(packageJsonPath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (packageJson.homepage) {
      return packageJson.homepage;
    }

    if (packageJson.repository) {
      let repoUrl = packageJson.repository;
      if (typeof repoUrl === 'object') {
        repoUrl = repoUrl.url;
      }
      return repoUrl;
    }
  } catch (e) {
    // fallback to default
  }

  return null;
}

/**
 * Recursively collect all markdown files in given directories, excluding specified dirs.
 * @param {string[]} dirs - Directories or files to search
 * @param {string[]} [excludeDirs=[]] - Directory names to exclude
 * @returns {string[]} Array of markdown file paths
 */
export function getAllMarkdownFiles(dirs, excludeDirs = []) {
  let results = [];
  for (const dir of dirs) {
    // If it's a file, add and continue
    if (fs.statSync(dir).isFile()) {
      if (dir.endsWith('.md')) results.push(dir);
      continue;
    }
    // Otherwise, it's a directory
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of list) {
      if (file.isDirectory()) {
        if (excludeDirs.includes(file.name)) continue;
        results = results.concat(getAllMarkdownFiles([path.join(dir, file.name)], excludeDirs));
      } else if (file.name.endsWith('.md')) {
        results.push(path.join(dir, file.name));
      }
    }
  }
  return results;
}

/**
 * Parse NPM package name into scope and unscoped name.
 * @param {string} pkgName
 * @returns {{scope: string|null, name: string}}
 */
export function getScopeAndName(pkgName) {
  const match = pkgName.match(/^(@[^/]+)\/(.+)$/);
  if (match) {
    return { scope: match[1], name: match[2] };
  }
  return { scope: null, name: pkgName };
}
