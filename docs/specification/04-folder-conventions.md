# Folder Conventions

## Directory Structure

All existing paths are documented in `docs/02-folder-structure.md`. This document defines rules for **new files** only.

```
src/
  index.js              — Orchestrator (module registry, config lifecycle, install loop)
  contentScript.js      — Extension-only: message bridge between page and background
  background.js         — Extension-only: config propagation relay
  popup.js              — Extension-only: settings popup logic
  popup.html            — Extension-only: settings popup markup
  common.css            — Shared styles for all BetterCF-created elements
  custom.css            — User-configurable custom Codeforces styling (injected via config)

  env/
    config.js           — Config lifecycle (load, save, get, set, toggle, createUI)
    config_ui.js        — Reusable UI components for settings (Toggle, Select, Number, Shortcut)
    env.js              — Environment abstraction entry point
    env-shared.js       — Shared env logic (userHandle, ready, run_when_ready)
    env-extension.js    — Extension-specific env (MPH, storage, getURL)
    env-userscript.js   — Userscript-specific env (storage wrapper, getURL)

  helpers/
    dom.js              — DOM utilities ($, $$, on, element, fragment, isEditable)
    events.js           — In-memory event bus (listen, fire)
    Functional.js       — FP utilities (safe, pipe, map, once, debounce, formatShortcut)
    util.js             — Application utilities (toggleCoachMode)

  ext/                  — Feature modules
    dark_theme.js
    show_tags.js
    problemset.js
    search_button.js
    show_tutorial.js
    navbar.js
    redirector.js
    style.js
    shortcuts.js
    sidebar.js
    finder.js
    mashup.js
    change_page_title.js
    verdict_test_number.js

    standings/          — Multi-file feature
      common.js         — Shared standings utilities (runScripts, getStandingsPageContent)
      update.js         — Auto-update standings (setInterval)
      twin.js           — Twin standings container

assets/
  icons/                — Extension icons at 16, 32, 48, 128px
  bettercf-logo.png     — Full-size logo for navbar replacement
  bettercf-logo.svg     — Vector logo for popup header
```

## Rules for Adding New Files

### New Feature Module

1. Create the module in `src/ext/` as a single `.js` file.
2. If the module requires multiple files, create a subdirectory: `src/ext/your_feature/`.
3. Add styles to `src/common.css` using the `bettercf-` prefix. Do not create a new CSS file.
4. Register the module in `src/index.js` by adding it to the `modules` array.

### New Helper

1. Create the helper in `src/helpers/` if it will be used by at least two modules.
2. If used by only one module, colocate the utility inside that module.
3. Name the file descriptively: `string-utils.js`, `observer.js`, `storage.js`.

### New Environment Variant

1. Create the file in `src/env/` following the existing pattern.
2. Update `src/env/env.js` to conditionally import the new variant.
3. The build config in `rollup.config.js` must define the build target.

### New Asset

1. Place vector assets (SVG) in `assets/`.
2. Place raster icons in `assets/icons/` at all required sizes.
3. Update `rollup.config.js` if the asset needs to be copied to the build output.
4. Never commit large binary assets (> 100 KB) to the repository.

## Naming Conventions for Files

| Type | Convention | Example |
|------|------------|---------|
| Feature modules | Snake case | `dark_theme.js`, `show_tutorial.js` |
| Helpers | Camel case | `stringUtils.js` (if new) |
| Subdirectories | Snake case | `standings/` |
| Assets | Kebab case | `bettercf-logo.svg` |
| Documentation | Numbered prefix + kebab case | `01-project-vision.md` |

## What Not to Add

The following must not be added without an explicit decision documented in the specification:

- `node_modules/` at root (use `npm` / `yarn` with lockfile)
- Build output (`dist/`) in version control
- Framework configuration files (`.babelrc`, `rollup.config.js`) — these already exist
- CI/CD configuration — add when the project adopts a CI platform
- Third-party CSS frameworks (Bootstrap, Tailwind) — they conflict with Codeforces' own styles
