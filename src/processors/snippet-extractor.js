/**
 * Snippet Extractor
 *
 * Extracts code snippets from parsed markdown tokens.
 * Handles snippet metadata extraction including titles, descriptions, and language detection.
 */

/**
 * Extracts code snippets from markdown tokens
 * @param {Array} tokens - Parsed markdown tokens
 * @param {string} filePath - Source file path for context
 * @returns {Array} Array of snippet objects
 */
export function extractSnippetsFromTokens(tokens, filePath) {
  if (!tokens || !Array.isArray(tokens)) {
    return [];
  }

  const snippets = [];
  let lastHeading = '';
  let snippetCount = 1;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Track headings for snippet titles
    if (token.type === 'heading_open') {
      lastHeading = extractHeadingText(tokens, i);
    }

    // Extract code snippets from fence tokens
    if (token.type === 'fence') {
      const snippet = extractSnippetFromToken(token, tokens, i, lastHeading, snippetCount, filePath);
      if (snippet) {
        snippets.push(snippet);
        snippetCount++;
      }
    }
  }

  return snippets;
}

/**
 * Extracts heading text from heading tokens
 * @param {Array} tokens - All markdown tokens
 * @param {number} headingIndex - Index of heading_open token
 * @returns {string} Heading text
 */
function extractHeadingText(tokens, headingIndex) {
  if (headingIndex + 1 < tokens.length && tokens[headingIndex + 1].type === 'inline') {
    return tokens[headingIndex + 1].content.trim();
  }
  return '';
}

/**
 * Extracts a single snippet from a fence token
 * @param {Object} fenceToken - The fence token containing code
 * @param {Array} tokens - All markdown tokens for context
 * @param {number} tokenIndex - Index of the fence token
 * @param {string} lastHeading - Last heading text for title
 * @param {number} snippetCount - Current snippet number
 * @param {string} filePath - Source file path
 * @returns {Object|null} Snippet object or null if invalid
 */
function extractSnippetFromToken(fenceToken, tokens, tokenIndex, lastHeading, snippetCount, filePath) {
  if (!fenceToken || !fenceToken.content) {
    return null;
  }

  const title = lastHeading || `Snippet ${snippetCount}`;
  const language = fenceToken.info || 'text';
  const code = fenceToken.content;
  const description = extractSnippetDescription(tokens, tokenIndex);

  return {
    title: title.trim(),
    description: description.trim(),
    source: filePath,
    language: language.trim(),
    code: code.trim()
  };
}

/**
 * Extracts description for a snippet by looking backwards from the fence token
 * @param {Array} tokens - All markdown tokens
 * @param {number} fenceIndex - Index of the fence token
 * @returns {string} Description text
 */
function extractSnippetDescription(tokens, fenceIndex) {
  // Walk backwards to find the nearest non-empty inline or paragraph for description
  for (let i = fenceIndex - 1; i >= 0; i--) {
    const token = tokens[i];

    if (token.type === 'inline' && token.content.trim()) {
      return token.content.trim();
    }

    if (token.type === 'paragraph_open') {
      continue;
    }

    if (token.type === 'heading_open' || token.type === 'fence') {
      break;
    }
  }

  return '';
}

/**
 * Formats a snippet object into the standard output format
 * @param {Object} snippet - Snippet object
 * @returns {string} Formatted snippet string
 */
export function formatSnippet(snippet) {
  if (!snippet || !snippet.title || !snippet.code) {
    return '';
  }

  return [
    `TITLE: ${snippet.title}`,
    `DESCRIPTION: ${snippet.description || ''}`,
    `SOURCE: ${snippet.source || ''}`,
    `LANGUAGE: ${snippet.language || 'text'}`,
    `CODE:`,
    `\`\`\`${snippet.language || 'text'}`,
    snippet.code,
    '```',
    '',
    '----------------------------------------'
  ].join('\n');
}
