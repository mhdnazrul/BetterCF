# Folder Structure

## Complete Directory Tree

```
BetterCF/
│
├── .babelrc                          # Babel configuration
├── manifest.hjson                    # Manifest v2 source (HJSON format)
├── meta.js                           # Userscript metadata template
├── package.json                      # Project manifest, scripts, dependencies
├── rollup.config.js                  # Rollup build configuration
├── yarn.lock                         # Dependency lock file
├── README.md                         # Project README
│
├── assets/
│   ├── bettercf-logo.png             # BetterCF logo for branded logo replacement
│   ├── bettercf-logo.svg             # SVG version of BetterCF logo
│   └── icons/
│       ├── 16x16.png                 # Extension toolbar icon (16px)
│       ├── 32x32.png                 # Extension toolbar icon (32px)
│       ├── 48x48.png                 # Extension management icon (48px)
│       └── 128x128.png               # Chrome Web Store icon (128px)
│
├── src/
│   ├── index.js                      # Entry point / module orchestrator
│   ├── contentScript.js              # Message bridge (injected ⇄ background)
│   ├── background.js                 # Config propagation relay
│   ├── popup.html                    # Extension popup HTML shell
│   ├── popup.js                      # Popup settings logic
│   ├── common.css                    # Shared UI component styles
│   ├── custom.css                    # Custom Codeforces restyling
│   ├── min-browser-polyfill.js       # Browser API normalization
│   │
│   ├── env/                          # Environment abstraction layer
│   │   ├── env.js                    # Environment selector (extension vs userscript)
│   │   ├── env-shared.js             # Shared environment utilities
│   │   ├── env-extension.js          # Extension-specific (MPH, storage wrapper)
│   │   ├── env-userscript.js         # Userscript-specific (unsafeWindow, localStorage)
│   │   ├── config.js                 # Configuration manager
│   │   └── config_ui.js              # Settings UI components
│   │
│   ├── helpers/                      # Shared utility functions
│   │   ├── dom.js                    # DOM queries + custom JSX engine
│   │   ├── events.js                 # Minimal event bus
│   │   ├── Functional.js             # Functional programming utilities
│   │   └── util.js                   # Miscellaneous helpers
│   │
│   └── ext/                          # Feature modules
│       ├── style.js                  # CSS injection
│       ├── dark_theme.js             # Dark mode toggle
│       ├── show_tags.js              # "Show Tags" button
│       ├── problemset.js             # Tags hiding on problemset
│       ├── search_button.js          # "Google It" button
│       ├── show_tutorial.js          # Tutorial modal
│       ├── navbar.js                 # Custom navbar with dropdowns
│       ├── redirector.js             # Link redirects
│       ├── verdict_test_number.js    # Hide "on test X"
│       ├── shortcuts.js              # Keyboard shortcuts
│       ├── sidebar.js                # Sidebar action box
│       ├── finder.js                 # Page search utility
│       ├── mashup.js                 # Mashup tools
│       ├── change_page_title.js      # Dynamic page titles
│       └── standings/
│           ├── common.js             # Shared standings helpers
│           ├── update.js             # Auto-refresh standings
│           └── twin.js               # Div1/Div2 twin standings
│
└── test/
    ├── index.js                      # Test entry (tape + puppeteer)
    └── bundle.js                     # Compiled test bundle (generated)
```

---

## Directory and File Descriptions

### Root Files

| File | Purpose |
|------|---------|
| `.babelrc` | Babel configuration: `babel-preset-env` targeting last 5 Chrome versions, `@babel/preset-react` with custom pragma `dom.element` and pragmaFrag `dom.fragment` |
| `manifest.hjson` | Source manifest for the extension in HJSON format. Version injected at build time from `package.json`. Declares MV2, permissions, content scripts, background, browser action, icons. |
| `meta.js` | Userscript metadata block template with `{{VERSION}}` placeholder. Declares `@match`, `@grant unsafeWindow`, `@grant GM_addStyle`, update URLs. |
| `package.json` | Project metadata v2.4.1. Scripts for build, start, test, zip, clean. Dependencies include acorn, diff, minimist, webextension-polyfill. |
| `rollup.config.js` | Rollup configuration with 5 output targets (userscript, extension main, contentScript, background, popup, tests). Plugins: babel, import-css, inject-process-env, copy, terser. |
| `yarn.lock` | Dependency lock file for Yarn package manager. |

### `assets/` — Static Resources

Icons and logos used by the extension. Icons follow Chrome Web Store requirements (16, 32, 48, 128). The `bettercf-logo.png` image is used to replace the Codeforces logo in the navbar feature.

### `src/` — Main Source

All application code. Bundled by Rollup into `dist/` directory for extension and userscript targets.

### `src/env/` — Environment Abstraction

Abstracts differences between extension mode and userscript mode. The `env.js` file acts as a facade, selecting the appropriate implementation based on `process.env.TARGET`.

### `src/helpers/` — Shared Utilities

Reusable utility modules used across the codebase. `dom.js` is the most critical — it provides the JSX pragma function `element()` that Babel compiles JSX into.

### `src/ext/` — Extension Features

Self-contained feature modules, each with an `install()` function and optionally an `uninstall()` function. These are the core features that enhance Codeforces.

### `src/ext/standings/` — Standings Subsystem

Subdirectory containing three files for standings-related features: shared helpers (`common.js`), auto-refresh (`update.js`), and twin standings (`twin.js`).

### `test/` — Tests

Tape-based unit tests covering `events.js` and `Functional.js` utilities, plus a Puppeteer integration test that verifies Codeforces.com loads with the extension installed.
