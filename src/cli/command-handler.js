#!/usr/bin/env node

import { Command } from 'commander';
import { processConversion } from '../core/conversion-processor.js';
import { validateOptions } from './option-validator.js';

/**
 * CLI Command Handler
 *
 * Handles the command-line interface for the md2llm tool.
 * Parses arguments, validates options, and delegates to the conversion processor.
 */

/**
 * Sets up and configures the CLI commands
 * @returns {Command} Configured Commander instance
 */
export function setupCommands() {
  const program = new Command();

  program
    .name('md2llm')
    .description('A CLI tool for converting markdown to LLM rules')
    .version('1.0.0')
    .argument('<dest>', 'Destination directory for output files')
    .argument('<dirs...>', 'Source directories containing markdown files')
    .option('-f, --format <format>', 'Output format (md or mdc)', 'md')
    .option('-e, --exclude <dirs>',
      'Comma-separated list of directories to exclude',
      'images,node_modules,dist,build,coverage,test,cjs,generator,lib,src')
    .option('-s, --source-url <url>', 'Base URL for source links (e.g., https://github.com/user/repo/blob/main/)')
    .option('--always-apply', 'Set alwaysApply: true in mdc frontmatter (default for mdc format)')
    .option('--no-always-apply', 'Set alwaysApply: false in mdc frontmatter')
    .option('--apply-glob <pattern>', 'Use glob pattern instead of alwaysApply in mdc frontmatter')
    .action(handleConvertCommand);

  return program;
}

/**
 * Handles the convert command execution
 * @param {string} dest - Destination directory
 * @param {string[]} dirs - Source directories
 * @param {Object} options - Command options
 */
function handleConvertCommand(dest, dirs, options) {
  try {
    // Validate and normalize options
    const validatedOptions = validateOptions(options);

    console.log(`Converting markdown files from ${dirs.join(', ')} to ${dest}`);
    console.log(`Output format: ${validatedOptions.format}`);
    console.log(`Excluding directories: ${validatedOptions.excludeDirs.join(', ')}`);

    // Set environment variables for source URL
    if (validatedOptions.sourceUrl) {
      process.env.SOURCE_BASE_URL = validatedOptions.sourceUrl;
    }

    // Process the conversion
    processConversion(dest, dirs, validatedOptions);

  } catch (error) {
    console.error('Error during conversion:', error.message);
    throw error;
  }
}
