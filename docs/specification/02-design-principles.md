# Design Principles

Every design decision in BetterCF must be evaluated against these principles. They are ordered by priority.

## 1. Lightweight

The extension must feel invisible. Users should notice what BetterCF does, not that BetterCF is running.

- Every added kilobyte is a cost. Question every dependency.
- The current bundle size targets must not be exceeded without a documented exception.
- Prefer browser-native APIs over libraries.

## 2. Fast

Speed is a feature. Competitive programmers are impatient.

- All synchronous initialization must complete within the 0–50ms window before DOMContentLoaded.
- Config loading is the only synchronous work. Everything else defers.
- `env.ready()` must be used to defer DOM manipulation until the DOM is safe to query.
- `requestIdleCallback` should be used for non-critical initialization.

## 3. Minimal DOM Mutations

Extensions compete with the host page for layout stability. Be a good citizen.

- Batch DOM reads and writes. Minimize layout thrashing.
- Use `classList` over inline styles for toggling visibility.
- Prefer CSS-only solutions (e.g., `display: none` on a class) over JavaScript-removed elements.
- When removing or replacing elements, do so in a single synchronous pass.
- Avoid manipulating elements that the user is actively interacting with.

## 4. Modular

Every feature is a module. Modules are independent, replaceable, and testable.

- A module exports at most: `install()`, `uninstall()`, `init()`, and optionally `update()`. These four functions are the complete public API.
- A module must not import from another feature module. Cross-feature communication happens through the event bus (`helpers/events.js`) or shared configuration (`env/config.js`).
- A module that cannot be cleanly uninstalled must document this limitation in its file header.
- The core orchestrator (`index.js`) is the only file that imports all modules.

## 5. Accessible

Competitive programming tools must be accessible to everyone.

- All interactive elements must be keyboard-reachable and operable.
- Visual-only cues (color, icon, size) must be paired with text or `aria-label`.
- Custom modals must trap focus, support `Escape` to dismiss, and return focus on close.
- Toggle states must be communicated to assistive technology.

## 6. Progressive Enhancement

The extension should degrade gracefully when browser APIs are unavailable.

- Feature detection, not browser detection. Check for `requestIdleCallback`, `IntersectionObserver`, etc., before using them.
- The userscript build must work without any extension APIs. It stores config in `localStorage` only.
- The extension build should fall back to userscript-style behavior when extension APIs fail (e.g., `chrome.storage.sync` unavailable).

## 7. Backward Compatibility

Existing users must never lose their configuration or have their workflow broken.

- Storage keys must not change without a migration path. When a storage key changes, the old key must be read during a transition period.
- CSS class renames must be communicated in release notes if they affect user-written userstyles.
- Feature removals must be preceded by a deprecation notice for at least one full release cycle.

## 8. Observable

The extension must be debuggable in production.

- `console.log` calls must be gated behind `process.env.NODE_ENV === 'development'` (already done via `log` wrappers).
- Errors in feature installation must be caught and reported individually, not crash the extension.
- Feature modules must log their installation errors with the module name for easy identification.
