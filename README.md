# MD2LLM CLI

A command-line interface for converting markdown files to LLM rules, built with Commander.js.

## Installation

```bash
npm install
```

## Usage

### Global Installation (Optional)
```bash
npm link
```

### Running the CLI

```bash
# Convert markdown files to .md rules
node index.js convert ./output ./docs ./src

# Convert to .mdc format (Cursor rules)
node index.js convert ./output ./docs -f mdc

# Custom exclude directories
node index.js convert ./output ./docs -e "temp,backup,old"

# Custom source URL for links
node index.js convert ./output ./docs -s "https://github.com/user/repo/blob/main/"
```

## Commands

- `convert <dest> <dirs...>` - Convert markdown files to LLM rules
  - `-f, --format <format>` - Output format (md or mdc), default: md
  - `-e, --exclude <dirs>` - Comma-separated list of directories to exclude
  - `-s, --source-url <url>` - Base URL for source links

## Features

- Extracts code snippets from markdown files
- Generates structured rule files with metadata
- Supports both .md and .mdc (Cursor) formats
- Handles package.json scoping for README files
- Configurable directory exclusions
- Custom source URL support

## Development

```bash
# Run in development mode with file watching
npm run dev
```
