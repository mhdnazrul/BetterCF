# Contributing to BetterCF

Thank you for your interest in BetterCF! This document provides guidelines for contributing.

## Table of Contents

- [Development Setup](#development-setup)
- [Build & Test](#build--test)
- [Code Quality](#code-quality)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Commit Conventions](#commit-conventions)

## Development Setup

1. **Prerequisites**: Node.js 18+ and npm.
2. **Clone**: `git clone https://github.com/mhdnazrul/BetterCF.git`
3. **Install**: `npm install`
4. **Build**: `npm run build`

The built extension will be in `dist/extension/`. Load it as an unpacked extension in Chrome.

## Build & Test

```bash
npm run build         # Production build
npm run build:dev     # Development build with watch mode
npm test              # Run tests (requires build + test bundle)
```

To run Puppeteer tests, a display server is required (use `xvfb-run` on Linux).

## Code Quality

```bash
npm run lint          # Check code with ESLint
npm run format        # Auto-format with Prettier
npm run format:check  # Check formatting
```

All code must pass `npm run lint` before merging. Prettier formatting is checked in CI for new changes.

## Pull Request Process

1. Open an issue first to discuss the change you wish to make.
2. Create a feature branch from `main`.
3. Make your changes, following the existing code style:
   - 4-space indentation, no tabs
   - Semicolons required
   - Single quotes preferred
   - `const` over `let`, never `var`
   - ES2020+ syntax with async/await
4. Ensure all existing tests pass.
5. Add tests for new functionality.
6. Run `npm run lint` and fix any issues.
7. Open a pull request with a clear title and description.

## Project Structure

```
src/
  env/          — Environment and configuration
  helpers/      — Shared utilities (DOM, events, functional)
  modules/      — Feature modules (each exports install/uninstall/init/update)
popup/          — Extension popup UI
docs/           — Documentation
test/           — Tests (tape + puppeteer)
dist/           — Build output (generated)
```

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — A new feature
- `fix:` — A bug fix
- `refactor:` — Code change that neither fixes a bug nor adds a feature
- `docs:` — Documentation only changes
- `style:` — Changes that do not affect the meaning of the code
- `test:` — Adding or updating tests
- `chore:` — Changes to the build process or auxiliary tools

Example: `feat(standings): add contest phase indicator`
