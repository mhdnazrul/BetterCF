# Coding Standards

This document defines mandatory coding standards for all new BetterCF code. Existing code may deviate; new code must conform.

Existing conventions are documented in `docs/08-coding-conventions.md`. This document extends and formalizes those conventions.

## JavaScript Style

### Language Target

- Target **ES2020+** (optional chaining, nullish coalescing, `Promise.allSettled`, `globalThis`).
- Do not use proposals not yet in Stage 4.
- Babel will transpile as needed for older browser support.

### Formatting

- **Semicolons**: Required at end of statements.
- **Indentation**: 4 spaces. No tabs.
- **Quotes**: Single quotes for strings. Template literals for interpolation.
- **Equality**: Always `===` and `!==`. Use `==` only for `== null` (covers both `null` and `undefined`).
- **Line length**: Soft limit of 100 characters. Hard limit of 120.
- **Trailing commas**: Required for multiline arrays and objects.
- **Braces**: K&R style (opening brace on same line).

```javascript
// Good
function foo() {
    if (condition) {
        doSomething();
    }
}

// Bad
function foo()
{
    if (condition)
    {
        doSomething();
    }
}
```

### Variable Declarations

- `const` by default. `let` only when reassignment is necessary. Never `var`.
- Declare one variable per line.
- Destructure objects and arrays where it improves readability.

```javascript
// Good
const { key, value } = data;
const [first, second] = items;

// Bad
const a = 1, b = 2;
```

## Naming Conventions

| Construct | Convention | Example |
|-----------|------------|---------|
| Variables | camelCase | `userHandle`, `pageContent` |
| Functions | camelCase | `getTutorialHTML`, `sendChangeToInjected` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_CONFIG`, `API_BASE_URL` |
| Classes/PascalCase | Components | `Config`, `Toggle`, `Result` |
| Files | snake_case.js | `show_tutorial.js` |
| CSS classes | kebab-case with `bettercf-` prefix | `bettercf-modal-inner` |
| Event names | camelCase or quoted with spaces | `'standings updated'`, `'request config change'` |
| Config keys | camelCase | `showTags`, `standingsItv` |
| Private functions | camelCase, no underscore prefix | `function parseData() { ... }` |

## Comments

- File headers: `/** @file Description of the module */`
- Function docs: JSDoc only for exported functions with non-obvious parameters.
- Inline comments: Explain **why**, not what. The code says what.
- `// TODO:` for known incomplete work. Include a ticket reference if one exists.
- `// FIXME:` for known bugs. Include a link to the issue.
- No comment banners (e.g., `// === SECTION ===`). Use markdown-style headings in sparse comments.
- No commented-out code. Delete it.

```javascript
// Good
// Use requestIdleCallback to avoid blocking the main thread
if ('requestIdleCallback' in window) {
    requestIdleCallback(loadTutorial, { timeout: 10000 });
}
```

## Error Handling

- Use `tryCatch` / `safe` from `helpers/Functional.js` for defensive wrapping.
- Feature module `install()` must never throw. Wrap in `tryCatch` in the core.
- Recoverable errors should be logged with `console.error` and a descriptive message.
- Unrecoverable errors should show a user-visible message via `Codeforces.showMessage()`.
- Do not silently swallow errors. Every `catch` must either log, retry, or notify.

```javascript
// Good
.catch(err => console.error("Couldn't load standings. Reason: ", err));

// Acceptable
.catch(() => {}); // Only with a comment explaining why
```

## Async Rules

- Use `async`/`await` over `.then()` chains for new code.
- Existing `.then()` chains may remain until the file is refactored.
- `Promise.all()` for parallel independent operations.
- `Promise.allSettled()` when one failure should not reject the group.
- Always handle promise rejections. Unhandled rejections crash the process in Node and log warnings in browsers.
- Use `setTimeout` / `setInterval` only with a corresponding `clearTimeout` / `clearInterval` on uninstall.

## Imports

- Group imports: (1) built-in, (2) npm packages, (3) internal modules. Blank line between groups.
- Use relative paths for internal imports.
- Use default imports for utility objects (`dom`, `env`).
- Use namespace imports for modules with multiple exports (`* as config`).
- Use named imports for specific functions (`{ safe, once }`).

```javascript
// Good
import dom from '../helpers/dom';
import { safe, once } from '../helpers/Functional';
import * as config from '../env/config';
import env from '../env/env';
```

## Exports

- Named exports for functions and constants.
- Default exports for utility objects (singletons).
- Export at declaration when possible (`export const install = ...`), not at the bottom of the file.
- A feature module must export `install` at minimum. It may also export `uninstall`, `init`, `update`.

## Constants

- Define constants at the top of the module, after imports.
- Use `const` for all constants. Use `Object.freeze` for object constants.
- Configuration defaults belong in `src/env/config.js`.
- Magic numbers are not allowed. Name them.

```javascript
// Good
const POLL_INTERVAL = 5000;
const API_TIMEOUT = 20000;

// Bad
setInterval(fetchData, 5000);
setTimeout(reject, 20000);
```
