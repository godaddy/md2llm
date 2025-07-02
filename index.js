#!/usr/bin/env node

import { setupCommands } from './src/cli/command-handler.js';

/**
 * md2llm - A CLI tool for converting markdown to LLM rules
 *
 * Main entry point that sets up and executes the command-line interface.
 * See src/README.md for detailed architecture documentation.
 */

const program = setupCommands();
program.parse();
