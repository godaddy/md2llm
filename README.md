# md2llm

[![npm version](https://badge.fury.io/js/md2llm.svg)](https://badge.fury.io/js/md2llm)
[![npm downloads](https://img.shields.io/npm/dm/md2llm.svg)](https://www.npmjs.com/package/md2llm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-91%25-brightgreen.svg)](https://github.com/godaddy/md2llm)

![md2llm logo](images/md2llm-logo.png)

A command-line interface for converting markdown files to LLM rules, built with Commander.js.

## Requirements

- Node.js 20 or greater required
- Node.js 22+ recommended (uses latest APIs)

## What is md2llm?

md2llm extracts **code examples** from your markdown documentation and converts them into LLM rules. Unlike sending entire documentation files to LLMs, this tool focuses on the most valuable content: **working code examples**.

### Why Code Examples?

- **More Effective Context**: Code examples provide concrete, actionable patterns that LLMs can follow
- **Token Efficiency**: Instead of sending entire docs, you get focused, relevant code snippets
- **Better Results**: LLMs perform better with specific examples rather than verbose documentation

### IDE Compatibility

Your existing markdown files work seamlessly with:
- **VSCode** - Native markdown support with syntax highlighting
- **IntelliJ IDEA** - Full markdown editing and preview capabilities
- **Other editors** - Any editor that supports markdown

### Cursor Integration

When using the `.mdc` format, md2llm automatically adds front matter metadata that Cursor uses to:
- Apply rules contextually
- Set rule descriptions
- Configure rule behavior

### IDE-Specific Setups

md2llm generates markdown files that can be referenced by IDE-specific instruction files:

#### IntelliJ IDEA with Junie
- **Location**: `.junie/guidelines.md`
- **Usage**: Junie reads coding guidelines from this file
- **Integration**: Link to generated rules from your guidelines file

#### GitHub Copilot
- **Location**: `.github/copilot-instructions`
- **Usage**: Copilot uses these instructions for project-specific guidance
- **Integration**: Reference generated rules from your Copilot instruction file

#### Claude Desktop
- **Location**: `CLAUDE.md` (project root)
- **Usage**: Claude reads project context from this file
- **Integration**: Link to generated rules from your CLAUDE.md file

**Example workflow:**
```bash
# Generate rules first
md2llm ./rules ./docs --source-url "https://github.com/user/repo/blob/main/"

# Then reference them in your IDE files:
# .junie/guidelines.md:
# See our coding patterns: ./rules/function-patterns.md

# .github/copilot-instructions:
# Follow examples in: ./rules/api-examples.md

# CLAUDE.md:
# Check our guidelines: ./rules/component-patterns.md
```

## Installation

```bash
npm install -g md2llm
```

## Local Development Installation

```bash
npm i -g .
```

## Usage

### Running the CLI

```bash
# Convert markdown files to .md rules
md2llm ./output ./docs ./src

# Convert to .mdc format (Cursor rules)
md2llm ./output ./docs --format mdc

# Custom exclude directories
md2llm ./output ./docs --exclude "temp,backup,old"

# Custom source URL for links
md2llm ./output ./docs --source-url "https://github.com/user/repo/blob/main/"

# Multiple source directories
md2llm ./output ./docs ./src ./examples
```

## Options

- `-f, --format <format>` - Output format (md or mdc), default: md
- `-e, --exclude <dirs>` - Comma-separated list of directories to exclude (default: images,node_modules,dist,build,coverage,test,cjs,generator,lib,src)
- `-s, --source-url <url>` - Base URL for source links

## Features

- **Modular Architecture**: Clean, testable, and extensible codebase
- **Code Snippet Extraction**: Automatically extracts code blocks from markdown
- **Multiple Formats**: Supports both .md and .mdc (Cursor) output formats
- **Package Integration**: Handles package.json scoping for README files
- **Smart Filtering**: Excludes common non-documentation files (CHANGELOG, LICENSE, etc.)
- **Configurable Exclusions**: Custom directory exclusion patterns
- **Source URL Support**: Custom base URLs for source links
- **Comprehensive Testing**: Full test suite with unit, integration, and CLI tests

## Output Format

### MD Format

**Output file structure:**
```
TITLE: Example Function
DESCRIPTION: A simple JavaScript function
SOURCE: docs/example.md
LANGUAGE: javascript
CODE:
function greet(name) {
  return `Hello, ${name}!`;
}
----------------------------------------
@example
```

### MDC Format (Cursor)

**Output file structure:**
```
---
description: example
alwaysApply: true
---

TITLE: Example Function
DESCRIPTION: A simple JavaScript function
SOURCE: docs/example.md
LANGUAGE: javascript
CODE:
function greet(name) {
  return `Hello, ${name}!`;
}
----------------------------------------
@example
```

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Architecture

The tool is built with a modular architecture:

- **CLI Layer**: Command handling and option validation
- **Core Layer**: Main conversion orchestration
- **Processors**: Markdown parsing and snippet extraction
- **Formatters**: Output format generation
- **Utilities**: File operations and URL management

See `src/README.md` for detailed architecture documentation.

## Testing

The project includes comprehensive tests:

- **Unit Tests**: Individual module functionality
- **Integration Tests**: End-to-end conversion process
- **CLI Tests**: Real CLI execution scenarios

All tests use Node.js built-in test runner and achieve 100% pass rate.
