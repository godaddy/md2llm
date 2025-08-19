import { formatSnippet } from '../processors/snippet-extractor.js';

/**
 * Output Formatter
 *
 * Handles formatting of snippets into different output formats.
 * Supports both 'md' and 'mdc' output formats with appropriate frontmatter.
 */

/**
 * Generates output content from snippets
 * @param {Array} snippets - Array of snippet objects
 * @param {Object} outputInfo - Output file information
 * @param {string} format - Output format ('md' or 'mdc')
 * @param {Object} [options] - Additional options for content generation
 * @returns {string} Formatted output content
 */
export function generateOutputContent(snippets, outputInfo, format, options = {}) {
  if (!snippets || snippets.length === 0) {
    return '';
  }

  let content = '';

  // Add format-specific frontmatter
  if (format === 'mdc') {
    content += generateMdcFrontmatter(outputInfo, options);
  }

  // Add formatted snippets
  const formattedSnippets = snippets.map(snippet => formatSnippet(snippet));
  content += formattedSnippets.join('\n\n');

  // Add at-tag
  content += `\n${generateAtTag(outputInfo.atTag)}\n`;

  return content;
}

/**
 * Generates MDC frontmatter
 * @param {Object} outputInfo - Output file information
 * @param {Object} [options] - Options for frontmatter generation
 * @returns {string} MDC frontmatter string
 */
function generateMdcFrontmatter(outputInfo, options = {}) {
  const description = extractDescription(outputInfo);
  const frontmatterLines = [
    '---',
    `description: ${description}`
  ];

  // Add application rules based on options
  if (options.applyGlob) {
    frontmatterLines.push(`glob: "${options.applyGlob}"`);
  } else {
    // Use alwaysApply - default to true if not explicitly set to false
    const alwaysApply = options.alwaysApply !== false;
    frontmatterLines.push(`alwaysApply: ${alwaysApply}`);
  }

  frontmatterLines.push('---', '');
  return frontmatterLines.join('\n');
}

/**
 * Extracts description from output info
 * @param {Object} outputInfo - Output file information
 * @returns {string} Description for frontmatter
 */
function extractDescription(outputInfo) {
  // For now, use the output filename as description
  // This could be enhanced to extract from the first snippet or file content
  return outputInfo.outputFileName || 'Generated LLM rules';
}

/**
 * Generates at-tag for the output file
 * @param {string} atTag - Base at-tag
 * @returns {string} Formatted at-tag
 */
function generateAtTag(atTag) {
  if (!atTag) {
    return '';
  }

  // Add @ prefix if not already present
  return atTag.includes('@') ? atTag : `@${atTag}`;
}

/**
 * Determines output file extension based on format
 * @param {string} format - Output format
 * @returns {string} File extension
 */
export function getOutputExtension(format) {
  return format === 'mdc' ? '.mdc' : '.md';
}

/**
 * Validates output format
 * @param {string} format - Format to validate
 * @returns {boolean} True if format is valid
 */
export function isValidFormat(format) {
  return ['md', 'mdc'].includes(format);
}
