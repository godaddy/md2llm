# Modular Architecture Documentation

This document describes the modular architecture of the md2llm tool, which has been refactored for better maintainability, testability, and extensibility.

## Architecture Overview

The tool is organized into several distinct modules, each with a specific responsibility:

```
src/
├── cli/                    # Command-line interface handling
│   ├── command-handler.js  # CLI setup and command execution
│   └── option-validator.js # Option validation and normalization
├── core/                   # Core business logic
│   └── conversion-processor.js # Main conversion orchestration
├── processors/             # Content processing modules
│   ├── markdown-processor.js # Main markdown processing
│   └── snippet-extractor.js  # Code snippet extraction
├── formatters/             # Output formatting
│   └── output-formatter.js # Format-specific output generation
└── utils/                  # Utility modules
    ├── directory-manager.js    # Directory operations
    ├── file-collector.js       # File discovery and filtering
    └── source-url-manager.js   # Source URL generation
```

## Module Responsibilities

### CLI Layer (`src/cli/`)

**command-handler.js**
- Sets up Commander.js CLI structure
- Handles command execution and error handling
- Delegates to core conversion processor

**option-validator.js**
- Validates and normalizes CLI options
- Provides default values
- Ensures option format consistency

### Core Layer (`src/core/`)

**conversion-processor.js**
- Main orchestrator for the conversion process
- Coordinates between different modules
- Handles error reporting and progress tracking
- Filters out non-documentation files

### Processors (`src/processors/`)

**markdown-processor.js**
- Parses markdown files using markdown-it
- Manages file I/O operations
- Determines output file structure
- Handles package-specific logic

**snippet-extractor.js**
- Extracts code snippets from parsed tokens
- Manages snippet metadata (title, description, language)
- Handles context-aware snippet extraction

### Formatters (`src/formatters/`)

**output-formatter.js**
- Generates format-specific output (md/mdc)
- Handles frontmatter generation for mdc format
- Manages at-tag generation

### Utilities (`src/utils/`)

**directory-manager.js**
- Handles directory creation and path operations
- Manages output directory structure
- Provides path utilities

**file-collector.js**
- Discovers markdown files recursively
- Implements exclusion filtering
- Handles both file and directory inputs

**source-url-manager.js**
- Generates source URLs for files
- Handles package repository detection
- Manages custom source URL configuration

## Data Flow

1. **CLI Input** → `command-handler.js` validates and normalizes options
2. **Conversion Start** → `conversion-processor.js` orchestrates the process
3. **File Discovery** → `file-collector.js` finds markdown files
4. **Directory Setup** → `directory-manager.js` creates output structure
5. **File Processing** → `markdown-processor.js` parses each file
6. **Snippet Extraction** → `snippet-extractor.js` extracts code blocks
7. **Output Generation** → `output-formatter.js` formats the output
8. **File Writing** → Final output is written to disk

## Key Benefits

### Modularity
- Each module has a single responsibility
- Clear separation of concerns
- Easy to understand and maintain

### Testability
- Each module can be tested independently
- Clear interfaces between modules
- Mockable dependencies

### Extensibility
- Easy to add new output formats
- Simple to extend snippet extraction logic
- Modular CLI option handling

### Error Handling
- Centralized error handling in CLI layer
- Graceful degradation for individual file failures
- Clear error messages and logging

## Usage Examples

### Programmatic Usage

```javascript
import { processConversion } from './src/core/conversion-processor.js';

const options = {
  format: 'mdc',
  excludeDirs: ['node_modules', 'dist']
};

processConversion('./output', ['./src'], options);
```

### CLI Usage

```bash
# Basic usage
md2llm ./output ./src

# With options
md2llm ./output ./src --format mdc --exclude node_modules,dist --source-url https://github.com/user/repo/blob/main/
```

## Migration from Legacy Code

The old monolithic structure has been preserved in `create-rules.js` for backward compatibility, but it now delegates to the new modular structure. A deprecation warning is shown when using the legacy API.

## Future Enhancements

The modular structure makes it easy to add:

- New output formats (JSON, YAML, etc.)
- Additional snippet extraction strategies
- Custom filtering rules
- Plugin system for extensibility
- Better error recovery mechanisms
- Progress reporting and cancellation
