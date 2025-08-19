/**
 * Option Validator
 *
 * Validates and normalizes CLI options for the md2llm tool.
 * Ensures all options are in the correct format and within valid ranges.
 */

/**
 * Default configuration values
 */
const DEFAULTS = {
  format: 'md',
  excludeDirs: ['images', 'node_modules', 'dist', 'build', 'coverage', 'test', 'cjs', 'generator', 'lib', 'src'],
  sourceUrl: null,
  alwaysApply: null, // null means use format default (true for mdc, n/a for md)
  applyGlob: null
};

/**
 * Valid output formats
 */
const VALID_FORMATS = ['md', 'mdc'];

/**
 * Validates and normalizes CLI options
 * @param {Object} options - Raw CLI options
 * @returns {Object} Validated and normalized options
 * @throws {Error} If options are invalid
 */
export function validateOptions(options) {
  const validated = { ...DEFAULTS };

  // Validate and set format
  if (options.format) {
    if (!VALID_FORMATS.includes(options.format)) {
      throw new Error(`Invalid format: ${options.format}. Must be one of: ${VALID_FORMATS.join(', ')}`);
    }
    validated.format = options.format;
  }

  // Validate and set exclude directories
  if (options.exclude) {
    validated.excludeDirs = parseExcludeDirs(options.exclude);
  }

  // Validate and set source URL
  if (options.sourceUrl) {
    validated.sourceUrl = validateSourceUrl(options.sourceUrl);
  }

  // Validate and set mdc rule options
  validateMdcOptions(options, validated);

  return validated;
}

/**
 * Parses comma-separated exclude directories string into array
 * @param {string} excludeString - Comma-separated directory names
 * @returns {string[]} Array of directory names
 */
function parseExcludeDirs(excludeString) {
  if (!excludeString || typeof excludeString !== 'string') {
    return DEFAULTS.excludeDirs;
  }

  const parsed = excludeString
    .split(',')
    .map(dir => dir.trim())
    .filter(dir => dir.length > 0);

  return parsed.length > 0 ? parsed : DEFAULTS.excludeDirs;
}

/**
 * Validates source URL format
 * @param {string} url - Source URL to validate
 * @returns {string} Validated URL
 * @throws {Error} If URL is invalid
 */
function validateSourceUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Basic URL validation - should start with http:// or https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error(`Invalid source URL: ${url}. Must start with http:// or https://`);
  }

  // Ensure URL ends with / for proper path joining
  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Validates and sets MDC rule configuration options
 * @param {Object} options - Raw CLI options
 * @param {Object} validated - Validated options object to modify
 * @throws {Error} If options are invalid
 */
function validateMdcOptions(options, validated) {
  // Handle alwaysApply option
  if (options.alwaysApply === true) {
    validated.alwaysApply = true;
  } else if (options.alwaysApply === false) {
    validated.alwaysApply = false;
  }

  // Handle applyGlob option
  if (options.applyGlob !== undefined) {
    if (typeof options.applyGlob !== 'string' || options.applyGlob.trim().length === 0) {
      throw new Error('Invalid apply-glob pattern: must be a non-empty string');
    }
    validated.applyGlob = options.applyGlob.trim();
  }

  // Validate that alwaysApply and applyGlob are mutually exclusive
  if (validated.alwaysApply !== null && validated.applyGlob) {
    throw new Error('Cannot use both --always-apply/--no-always-apply and --apply-glob options together');
  }
}
