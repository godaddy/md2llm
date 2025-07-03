# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 - 2024-12-19

### Added
- Initial release of md2llm CLI tool
- Core functionality to convert markdown files to LLM rules
- Support for extracting code examples from markdown documentation
- Multiple output formats: `.md` (standard) and `.mdc` (Cursor-compatible)
- Command-line interface with Commander.js
- Modular architecture with separate processors, formatters, and utilities
- Smart file filtering and directory exclusion patterns
- Source URL support for generating links back to original documentation
- Package.json scoping for README files
- Comprehensive test suite with unit, integration, and CLI tests
- Cross-platform compatibility (Windows, macOS, Linux)
- Node.js 20+ requirement with Node.js 22+ recommended

### Features
- **Code Snippet Extraction**: Automatically extracts code blocks from markdown files
- **IDE Integration**: Generates rules compatible with VSCode, IntelliJ IDEA, GitHub Copilot, and Claude Desktop
- **Cursor Integration**: `.mdc` format with front matter metadata for contextual rule application
- **Configurable Exclusions**: Built-in and custom directory exclusion patterns
- **Source Attribution**: Maintains links to original documentation sources
- **Token Efficiency**: Focuses on code examples rather than verbose documentation

### Technical Details
- Built with ES modules and modern Node.js APIs
- Uses markdown-it for markdown parsing
- Comprehensive error handling and validation
- 100% test coverage with Node.js built-in test runner
- ESLint configuration with GoDaddy standards
- MIT license with public npm package access
