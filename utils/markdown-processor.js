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
  const snippets = [];
  let fileNameWithoutExt = path.basename(filePath, '.md');
  let atTag = fileNameWithoutExt;
  let outFileName = fileNameWithoutExt;
  let outFileExt = format === 'mdc' ? '.mdc' : '.md';
  let source = getSourceUrl(filePath);
  let outputDir = rulesDir;

  // Special handling for package README.md (and package-level docs)
  const pkgReadmeMatch = filePath.match(/README\.md$/);
  if (pkgReadmeMatch) {
    const pkgDir = path.dirname(filePath);
    const pkgJsonPath = path.join(pkgDir, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (pkgJson.name) {
          const { scope, name } = getScopeAndName(pkgJson.name);
          outFileName = name;
          atTag = name;
          if (scope) {
            outputDir = path.join(rulesDir, scope);
            createDir(outputDir);
          }
        }
      } catch (e) {
        // fallback to default
      }
    }
  }

  const src = fs.readFileSync(filePath, 'utf8');
  const tokens = md.parse(src, {});
  let lastHeading = '';
  let snippetCount = 1;
  let description = '';
  let firstHeading = '';

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'heading_open') {
      if (tokens[i + 1] && tokens[i + 1].type === 'inline') {
        lastHeading = tokens[i + 1].content.trim();
        if (!firstHeading) firstHeading = lastHeading;
      }
    }
    if (t.type === 'fence') {
      // Walk backwards to find the nearest non-empty inline or paragraph for description
      for (let j = i - 1; j >= 0; j--) {
        const prev = tokens[j];
        if (prev.type === 'inline' && prev.content.trim()) {
          description = prev.content.trim();
          break;
        }
        if (prev.type === 'paragraph_open') {
          continue;
        }
        if (prev.type === 'heading_open' || prev.type === 'fence') {
          break;
        }
      }

      const title = lastHeading || `Snippet ${snippetCount}`;
      const language = t.info || 'text';
      const code = t.content;
      snippets.push(
        `TITLE: ${title}\n` +
        `DESCRIPTION: ${description}\n` +
        `SOURCE: ${source}\n` +
        `LANGUAGE: ${language}\n` +
        `CODE:\n\`\`\`${language}\n${code}\n\`\`\`\n` +
        `\n----------------------------------------\n`
      );
      snippetCount++;
    }
  }

  if (snippets.length === 0) return;

  // Use first heading or fallback to file name for frontmatter description
  const frontmatterDescription = firstHeading || fileNameWithoutExt;

  let content = '';
  if (outFileExt === '.mdc') {
    content += `---\n`;
    content += `description: ${frontmatterDescription}\n`;
    content += `alwaysApply: true\n`;
    content += `---\n\n`;
  }
  content += snippets.join('\n');
  content += `\n${atTag.includes('@') ? atTag : `@${atTag}`}\n`;

  fs.writeFileSync(
    path.join(outputDir, `${outFileName}${outFileExt}`),
    content
  );
  console.log(`Wrote ${snippets.length} snippets to ${outputDir} / ${outFileName}${outFileExt}`);
}
