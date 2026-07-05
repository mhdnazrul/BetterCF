# Project Overview

## What is BetterCF?

BetterCF is a **dual-target browser extension** and **userscript** that augments the Codeforces competitive programming platform. It provides 15+ features including dark mode, enhanced navigation, problem tags management, tutorial viewer, standings auto-refresh, keyboard shortcuts, and more.

Forked from [Codeforces++](https://github.com/LeoRiether/CodeforcesPP) by Leonardo Riether.

---

## Architecture

### Dual-Target Design

The same codebase compiles to two distinct targets:

| Target | Mechanism | Background Script | Content Script | Storage |
|--------|-----------|-------------------|----------------|---------|
| **Extension** (Chrome/Firefox) | Manifest v2 with content script bridge | `background.js` (event page, non-persistent) | `contentScript.js` (isolated world) | `chrome.storage.sync` + `localStorage` |
| **Userscript** (Tampermonkey/Violentmonkey) | IIFE injected by userscript manager | None | None (runs in page context) | `localStorage` only |

### Code Injection Pattern (Extension Mode)

The extension uses a **content-script bridge pattern**:

1. `contentScript.js` runs in the **isolated world** (cannot access page JavaScript globals)
2. It injects `index.js` into the page via a dynamically created `<script>` element
3. `index.js` runs in the **page context** with full access to Codeforces' own globals (`Codeforces`, `MathJax`, `submissionsEventCatcher`)
4. Communication between the two worlds happens via `window.postMessage`

### Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   POPUP (popup.html/popup.js)                │
│  Settings UI — reads/writes chrome.storage.sync             │
│  Sends config changes to all Codeforces tabs                │
└─────────────────────┬───────────────────────────────────────┘
                      │ browser.tabs.sendMessage
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKGROUND (background.js)                     │
│  Config propagation relay — non-persistent event page        │
│  Receives 'propagate config' → broadcasts to all CF tabs    │
└─────────────────────┬───────────────────────────────────────┘
                      │ browser.runtime.sendMessage
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              CONTENT SCRIPT (contentScript.js)               │
│  Message bridge — isolated world                            │
│  • Routes window.postMessage → storage APIs or background   │
│  • Forwards background messages → page context              │
│  • Injects <script src="index.js"> into the page            │
└─────────────────────┬───────────────────────────────────────┘
                      │ window.postMessage
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              INJECTED SCRIPT (index.js)                      │
│  Page context — full access to Codeforces globals           │
│  • Config management (localStorage + sync)                  │
│  • Feature module orchestration (15 features)               │
│  • Custom event bus for inter-module communication          │
│  • Custom JSX for DOM creation                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Technologies

| Technology | Usage |
|------------|-------|
| **JavaScript (ES6+)** | Entire codebase, no TypeScript |
| **Rollup** | Module bundler with 5 output targets |
| **Babel** | JSX transpilation (custom pragma), ES6+ to ES5 |
| **JSX (custom)** | `dom.element()` via Babel pragma — no React dependency |
| **HJSON** | Human-readable JSON for manifest source |
| **Tape + Puppeteer** | Unit testing and browser integration tests |
| **webextension-polyfill** | Cross-browser extension API normalization |

---

## Manifest Summary

| Field | Value |
|-------|-------|
| manifest_version | 2 |
| name | BetterCF |
| permissions | storage, `*://codeforces.com/*`, `http://fonts.googleapis.com/*`, `https://fonts.googleapis.com/*` |
| content_scripts | `*://codeforces.com/*`, run_at: `document_start`, js: `browser-polyfill.min.js`, `contentScript.js`, css: `common.css` |
| background | persistent: false, scripts: `browser-polyfill.min.js`, `background.js` |
| browser_action | default_popup: `popup.html` |
| web_accessible_resources | `*.js` |

---

## Build System

### Rollup Targets

The `rollup.config.js` defines 5 output targets:

| Target | Format | Output File | Purpose |
|--------|--------|-------------|---------|
| Userscript | IIFE | `dist/userscript/script.user.js` | Single-file userscript with metadata banner |
| Extension Main | IIFE | `dist/extension/index.js` | Injected into page context |
| Content Script | ESM | `dist/extension/contentScript.js` | Isolated world bridge |
| Background | ESM | `dist/extension/background.js` | Event page |
| Popup | ESM | `dist/extension/popup.js` | Popup settings |
| Tests | CJS | `test/bundle.js` | Unit tests |

### Build Scripts

```json
{
  "start": "rollup -c -w --environment NODE_ENV:development",
  "build": "rollup -c --environment NODE_ENV:production",
  "clean": "rm -r dist/",
  "test": "node test/bundle.js",
  "zip": "7z a dist/bundle.zip ./dist/extension/*"
}
```
