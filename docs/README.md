# BetterCF — Technical Documentation

**Repository**: [github.com/mhdnazrul/BetterCF](https://github.com/mhdnazrul/BetterCF)  

**Forked from**: [github.com/LeoRiether/CodeforcesPP](https://github.com/LeoRiether/CodeforcesPP) by Leonardo Riether  
**Version**: 1.0.0  
**Build System**: Rollup + Babel  
**Targets**: Chrome Extension (MV2), Firefox Extension (MV2), Userscript (Tampermonkey/Violentmonkey/Greasemonkey)

---

## Table of Contents

| # | Document | Description |
|---|----------|-------------|
| 01 | [Project Overview](./01-project-overview.md) | Architecture, dual-target design, key technologies, manifest summary |
| 02 | [Folder Structure](./02-folder-structure.md) | Complete directory tree and description of every file |
| 03 | [Runtime Flow](./03-runtime-flow.md) | Startup sequence, execution flow for all entry points, runtime timeline |
| 04 | [Message Flow](./04-message-flow.md) | IPC architecture, MPH system, message routing diagrams for each message type |
| 05 | [Feature Registry](./05-feature-registry.md) | Complete table of all 15 features, their lifecycle, config keys, UI elements |
| 06 | [Module Dependency](./06-module-dependency.md) | Dependency graph, import/export tables, module dependency matrix |
| 07 | [Developer Guide](./07-developer-guide.md) | How to add a new feature, how to remove a feature, step-by-step instructions |
| 08 | [Coding Conventions](./08-coding-conventions.md) | JavaScript style, JSX conventions, naming rules, module patterns |
| 09 | [Architecture Diagrams](./09-architecture-diagrams.md) | Mermaid diagrams: layers, module dependencies, execution timeline, message flow |

---

## Quick Reference

| Aspect | Detail |
|--------|--------|
| **Entry Point** | `src/index.js` — injected into page context by `contentScript.js` |
| **JSX Engine** | Custom `dom.element()` — no React dependency |
| **State Management** | In-memory event bus (`helpers/events.js`) |
| **Config Storage** | `localStorage.bettercf` (primary) + `chrome.storage.sync` (cross-device) |
| **Message Passing** | `window.postMessage` → Content Script → `browser.runtime` → Background |
| **CSS** | `common.css` (manifest-injected) + `custom.css` (JS-injected) |
| **Dark Mode** | CSS `filter: invert(1) hue-rotate(180deg)` on `<html>` |
| **Build** | Rollup with Babel, CSS import, env injection, terser minification |
