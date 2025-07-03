# Windows Support

This CLI tool is fully compatible with Windows systems.

## Installation

### Global Installation
```cmd
npm install -g md2llm
```

### Local Installation
```cmd
npm install md2llm
```

## Usage

The CLI works identically on Windows as it does on Unix systems:

```cmd
md2llm output-dir src docs
md2llm output-dir src --format mdc
md2llm output-dir src --exclude "node_modules,dist"
```

## Windows-Specific Notes

### Path Separators
- The tool automatically handles Windows backslashes (`\`) and Unix forward slashes (`/`)
- All path operations use Node.js built-ins that are cross-platform compatible
- Path normalization is handled by dedicated utilities in `src/utils/path-utils.js`

### File Permissions
- Ensure you have write permissions to the output directory
- Some antivirus software may interfere with file operations - add exceptions if needed

### Command Prompt vs PowerShell
- Works in both Command Prompt and PowerShell
- For PowerShell, you may need to set execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Long Paths
- Windows has a 260-character path limit by default
- For very deep directory structures, consider using shorter base paths
- Windows 10+ supports longer paths with registry changes

## Troubleshooting

### "md2llm is not recognized"
- Ensure npm global bin directory is in your PATH
- Try running: `npm config get prefix` and add `\node_modules\.bin` to PATH

### Permission Denied
- Run Command Prompt as Administrator
- Check file/folder permissions
- Disable antivirus temporarily for testing

### Path Issues
- Use quotes around paths with spaces: `md2llm "output dir" "source dir"`
- Use forward slashes if backslashes cause issues: `md2llm output-dir src/docs`

## Testing on Windows

The project includes comprehensive cross-platform testing:

### Automated Testing
```cmd
npm run test:windows
```

### Manual Testing with Docker
```bash
# On Unix/Linux/macOS
./test-windows.sh
```

The testing infrastructure includes:
- Cross-platform path handling tests
- Windows-style path compatibility verification
- Package structure validation (ensures `md2llm.cmd` is included)
- File operation tests with mixed path separators
- CLI functionality tests with Windows-style arguments

## Development

When developing on Windows:
1. Use Git Bash or WSL for Unix-like development experience
2. Ensure line endings are handled correctly (Git config: `core.autocrlf true`)
3. Test with both Command Prompt and PowerShell
4. Run `npm run test:windows` to verify cross-platform compatibility
