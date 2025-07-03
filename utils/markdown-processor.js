import fs from 'fs';
import path from 'path';
import markdownIt from 'markdown-it';
import { getSourceUrl, getScopeAndName, createDir } from './file-utils.js';

const md = markdownIt();

/**
 * Parse a markdown file and write code snippets to a .mdc file in rulesDir.
 * @param {string} filePath - Path to markdown file
 * @param {string} rulesDir - Output directory for .mdc files
 * @param {string} format - Format of the output file
 */
export function formatSnippetsInFile(filePath, rulesDir, format = 'md') {
  const fileInfo = getFileInfo(filePath, rulesDir, format);
  const tokens = md.parse(fs.readFileSync(filePath, 'utf8'), {});
  const snippets = extractSnippets(tokens, fileInfo.source);

  if (snippets.length === 0) return;

  const content = generateContent(snippets, fileInfo, format);
  writeOutputFile(content, fileInfo, format);
}

/**
 * Gets file information and output configuration
 * @param {string} filePath - Path to markdown file
 * @param {string} rulesDir - Output directory
 * @returns {Object} File information
 */
function getFileInfo(filePath, rulesDir) {
  const fileNameWithoutExt = path.basename(filePath, '.md');
  const source = getSourceUrl(filePath);
  let atTag = fileNameWithoutExt;
  let outFileName = fileNameWithoutExt;
  let outputDir = rulesDir;

  // Handle package README.md
  if (filePath.match(/README\.md$/)) {
    const pkgInfo = getPackageInfo(filePath);
    if (pkgInfo) {
      outFileName = pkgInfo.name;
      atTag = pkgInfo.name;
      if (pkgInfo.scope) {
        outputDir = path.join(rulesDir, pkgInfo.scope);
        createDir(outputDir);
      }
    }
  }

  return {
    fileNameWithoutExt,
    source,
    atTag,
    outFileName,
    outputDir
  };
}

/**
 * Gets package information from package.json
 * @param {string} filePath - Path to markdown file
 * @returns {Object|null} Package info or null
 */
function getPackageInfo(filePath) {
  const pkgDir = path.dirname(filePath);
  const pkgJsonPath = path.join(pkgDir, 'package.json');

  if (!fs.existsSync(pkgJsonPath)) {
    return null;
  }

  try {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    if (pkgJson.name) {
      return getScopeAndName(pkgJson.name);
    }
  } catch (e) {
    // fallback to default
  }

  return null;
}

/**
 * Extracts snippets from markdown tokens
 * @param {Array} tokens - Markdown tokens
 * @param {string} source - Source file path
 * @returns {Array} Array of snippet strings
 */
function extractSnippets(tokens, source) {
  const snippets = [];
  let lastHeading = '';
  let snippetCount = 1;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (t.type === 'heading_open') {
      lastHeading = extractHeadingText(tokens, i);
    }

    if (t.type === 'fence') {
      const snippet = createSnippet(t, { tokens, index: i, lastHeading, snippetCount, source });
      snippets.push(snippet);
      snippetCount++;
    }
  }

  return snippets;
}

/**
 * Extracts heading text from tokens
 * @param {Array} tokens - Markdown tokens
 * @param {number} index - Index of heading_open token
 * @returns {string} Heading text
 */
function extractHeadingText(tokens, index) {
  if (tokens[index + 1] && tokens[index + 1].type === 'inline') {
    return tokens[index + 1].content.trim();
  }
  return '';
}

/**
 * Creates a snippet from a fence token
 * @param {Object} fenceToken - Fence token
 * @param {Object} options - Options object
 * @param {Array} options.tokens - All tokens
 * @param {number} options.index - Token index
 * @param {string} options.lastHeading - Last heading text
 * @param {number} options.snippetCount - Snippet count
 * @param {string} options.source - Source file
 * @returns {string} Formatted snippet
 */
function createSnippet(fenceToken, options) {
  const { tokens, index, lastHeading, snippetCount, source } = options;
  const description = extractDescription(tokens, index);
  const title = lastHeading || `Snippet ${snippetCount}`;
  const language = fenceToken.info || 'text';
  const code = fenceToken.content;

  return formatSnippet({ title, description, source, language, code });
}

/**
 * Extracts description for a snippet
 * @param {Array} tokens - Markdown tokens
 * @param {number} fenceIndex - Index of fence token
 * @returns {string} Description text
 */
function extractDescription(tokens, fenceIndex) {
  for (let j = fenceIndex - 1; j >= 0; j--) {
    const prev = tokens[j];
    if (prev.type === 'inline' && prev.content.trim()) {
      return prev.content.trim();
    }
    if (prev.type === 'paragraph_open') {
      continue;
    }
    if (prev.type === 'heading_open' || prev.type === 'fence') {
      break;
    }
  }
  return '';
}

/**
 * Formats a snippet into string
 * @param {Object} snippet - Snippet object
 * @param {string} snippet.title - Snippet title
 * @param {string} snippet.description - Snippet description
 * @param {string} snippet.source - Source file
 * @param {string} snippet.language - Code language
 * @param {string} snippet.code - Code content
 * @returns {string} Formatted snippet
 */
function formatSnippet(snippet) {
  return `TITLE: ${snippet.title}\n` +
    `DESCRIPTION: ${snippet.description}\n` +
    `SOURCE: ${snippet.source}\n` +
    `LANGUAGE: ${snippet.language}\n` +
    `CODE:\n\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`\n` +
    `\n----------------------------------------\n`;
}

/**
 * Generates output content
 * @param {Array} snippets - Array of snippet strings
 * @param {Object} fileInfo - File information
 * @param {string} format - Output format
 * @returns {string} Generated content
 */
function generateContent(snippets, fileInfo, format) {
  let content = '';

  if (format === 'mdc') {
    const description = fileInfo.fileNameWithoutExt;
    content += `---\n`;
    content += `description: ${description}\n`;
    content += `alwaysApply: true\n`;
    content += `---\n\n`;
  }

  content += snippets.join('\n');
  content += `\n${fileInfo.atTag.includes('@') ? fileInfo.atTag : `@${fileInfo.atTag}`}\n`;

  return content;
}

/**
 * Writes output file
 * @param {string} content - File content
 * @param {Object} fileInfo - File information
 * @param {string} format - Output format
 */
function writeOutputFile(content, fileInfo, format) {
  const outFileExt = format === 'mdc' ? '.mdc' : '.md';
  const outputPath = path.join(fileInfo.outputDir, `${fileInfo.outFileName}${outFileExt}`);

  fs.writeFileSync(outputPath, content);
  const snippetCount = content.split('TITLE:').length - 1;
  console.log(`Wrote ${snippetCount} snippets to ${fileInfo.outputDir} / ${fileInfo.outFileName}${outFileExt}`);
}
