# Testing Guidelines

## Current State

BetterCF has minimal automated testing. There is a single test entry point at `test/index.js` that produces `test/bundle.js` via Rollup. The tests use the `tape` framework and appear to target puppeteer-based integration testing.

This document describes the **desired future state** of testing. Incremental improvements should move toward this spec without blocking releases.

## Manual Testing Checklist

Every release must pass the following manual tests across all supported browsers.

### Installation

| Test | Expected Result |
|------|----------------|
| Install from Chrome Web Store | Extension appears in toolbar, no errors |
| Install from Firefox Add-ons | Extension appears in toolbar, no errors |
| Install via userscript (Tampermonkey) | Script appears in dashboard, no errors |
| Install via userscript (Violentmonkey) | Same as above |
| Install via userscript (Greasemonkey) | Same as above |
| Extension icon click | Popup opens with settings |
| Uninstall extension | No residual localStorage or chrome.storage data |

### Page Load

| Test | Expected Result |
|------|----------------|
| Navigate to `codeforces.com` | No console errors. "BetterCF is running!" logged in dev mode. |
| Navigate to `codeforces.com/problemset/problem/1/A` | All applicable features load. No errors. |
| Navigate to `codeforces.com/contest/1000` | Contest-specific features load. |
| Navigate to `codeforces.com/gym/100000` | Gym-specific features load. |
| Navigate to `codeforces.com/standings` | Standings features load. |
| Navigate to a mashup page | Mashup features load. |
| Navigate to `codeforces.com/profile/user` | No non-applicable features attempt to install. |

### Features

| Test | Expected Result |
|------|----------------|
| Toggle custom style | CSS changes apply/remove immediately. |
| Toggle dark mode | Page inverts. Toggle shortcut `Ctrl+I` works. |
| Show tags button | On unsolved problem, tags hidden with "Show" button. Clicking shows tags. |
| Problemset tags | Unsolved problem tags hidden. Toggle off shows them. |
| Google It button | On gym/group problem, button appears and links to Google search. |
| Tutorial modal | "Tutorial" link appears on problem pages. Click opens modal with content. |
| Navbar dropdowns | Navbar items have dropdown menus on hover. |
| Link redirects | Standings links redirect to friends view. Group members link redirects to contests. |
| Virtual contest button | On gym pages, "Start virtual contest" button appears. |
| Auto-update standings | Set interval > 0, standings refresh at that interval. |
| Twin standings | On div1/div2 contest, twin standings appear below. |
| Hide test number | Verdicts hide "on test X". Toggle restores. |
| Keyboard shortcuts | All default shortcuts work (`Ctrl+I`, `Ctrl+Space`, `Ctrl+S`, etc.). |
| Sidebar box | Menu links moved to sidebar table. |
| Finder (`Ctrl+Space`) | Modal opens with searchable navigation. Typing filters results. Enter navigates. |
| Mashup tools | "Add all" and "Toggle tag spoilers" buttons appear on mashup pages. |
| Page title | Problem page title updates to include problem name. |

### Popup

| Test | Expected Result |
|------|----------------|
| Toggle a setting | Setting changes immediately. All open tabs reflect the change. |
| Change a shortcut | Shortcut updates immediately. Old binding stops working. |
| Open popup on non-CF page | Popup shows but cannot communicate with tabs. |

### Config Persistence

| Test | Expected Result |
|------|----------------|
| Change setting, reload page | Setting persists. |
| Change setting in one browser, sync to another | Setting syncs (requires Chrome sync enabled). |
| Userscript: change setting, reload | Setting persists in localStorage. |

## Regression Checklist

Before any release, run through the manual testing checklist above. The following high-risk areas require particular attention:

1. **Config load/save cycle** — Affects every feature. A broken config load disables the entire extension.
2. **Message passing** — IS → CS → BG → CS → IS. Any break here breaks config sync.
3. **Version update flow** — The "BetterCF was updated" message and version check.
4. **Module isolation** — One module's error must not block others.
5. **Uninstall/cleanup** — Toggling a feature off must clean up all side effects.

## Future Automated Testing Roadmap

### Phase 1: Unit Tests (High Priority)

- Test `helpers/Functional.js` utilities (`safe`, `once`, `pipe`, `flatten`, `debounce`).
- Test `helpers/events.js` event bus (listen, fire, multiple listeners, cleanup).
- Test `env/config.js` config lifecycle (load, save, get, set, toggle, default merge).
- Test storage key migration logic when storage keys change.

**Framework**: `uvu` or `node:test` (lighter than Jest, no config needed for simple tests).

### Phase 2: Module Tests (Medium Priority)

- Test each feature module's `install()` and `uninstall()` with a mock DOM.
- Test that mock Codeforces globals are properly patched and restored.
- Test error handling (module throws, config key missing, element not found).

**Approach**: Use `jsdom` to create a minimal Codeforces-like DOM. Import modules directly. Call `install()` and verify DOM state. Call `uninstall()` and verify cleanup.

### Phase 3: Integration Tests (Lower Priority)

- Test the MPH message flow: mock `window.postMessage` and verify round-trip.
- Test the popup → tab config propagation: mock `browser.storage.sync` and `browser.tabs`.
- Test the userscript build produces a working IIFE that can be evaluated in a clean context.

**Approach**: Puppeteer-based (already partially scaffolded in `test/`). Launch a headless browser, load a fixture page, inject the extension/userscript, run behavior assertions.

### Phase 4: Visual Regression (Future)

- Screenshot comparison for critical UI states (popup, modals, navbar).
- Dark mode vs light mode screenshots.

**Approach**: Percy or Chromatic integration triggered by CI.

## Test File Layout

Future tests should follow this structure:

```
test/
  helpers/           — Unit tests for helpers
    Functional.test.js
    events.test.js
    dom.test.js
  env/               — Unit tests for env
    config.test.js
  ext/               — Unit tests for features
    dark_theme.test.js
    show_tutorial.test.js
  integration/       — Integration tests
    mph.test.js
    popup.test.js
  fixtures/           — HTML fixtures for DOM tests
    problem-page.html
    contest-page.html
  index.js           — Test entry point (existing)
```

## Testing Philosophy

1. **Test behavior, not implementation.** Test what the module does to the DOM, not how it does it.
2. **Prefer realistic mocks.** Mock `window`, `document`, `browser.*`, and Codeforces globals. Do not mock `dom.js` — test with real DOM operations.
3. **One assertion per test.** Each `test()` call should verify one behavior.
4. **No global state leakage.** Tests must clean up after themselves. Use `afterEach` hooks.
5. **Favor integration-like unit tests.** Test `install()` with a realistic DOM fragment, not with abstract assertions.
