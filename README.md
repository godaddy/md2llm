# md2llm

A command-line interface for converting markdown files to LLM rules, built with Commander.js.

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
md2llm convert ./output ./docs ./src

# Convert to .mdc format (Cursor rules)
md2llm convert ./output ./docs --format mdc

# Custom exclude directories
md2llm convert ./output ./docs --exclude "temp,backup,old"

# Custom source URL for links
md2llm convert ./output ./docs --source-url "https://github.com/user/repo/blob/main/"

# Multiple source directories
md2llm convert ./output ./docs ./src ./examples
```

## Commands

- `convert <dest> <dirs...>` - Convert markdown files to LLM rules
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
```
TITLE: Example Function
DESCRIPTION: A simple JavaScript function
SOURCE: docs/example.md
LANGUAGE: javascript
CODE:
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

----------------------------------------
@example
```

### MDC Format (Cursor)
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
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

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
