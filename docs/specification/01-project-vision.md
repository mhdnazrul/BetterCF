# Project Vision

## Purpose

BetterCF is a browser extension and userscript that enhances the Codeforces competitive programming platform. It improves readability, navigation, productivity, and the overall user experience for competitive programmers who spend significant time on Codeforces.

## Vision

BetterCF aims to become the **de facto enhancement suite for Codeforces** — trusted by the competitive programming community for its reliability, performance, and thoughtful design. The extension should feel like a natural part of Codeforces, augmenting the platform without overwhelming it.

## Long-Term Goals

| Goal | Description |
|------|-------------|
| **Stability** | Zero crashes, zero breaking changes across updates. Every release is backward-compatible. |
| **Performance** | All features must operate within a strict performance budget. No jank, no layout shifts, no memory leaks. |
| **Modularity** | Each feature is self-contained, removable, and independently testable. The core is a small orchestrator. |
| **Modernization** | Incrementally modernize the codebase without breaking existing functionality. Target ES2020+ syntax, modern browser APIs. |
| **Accessibility** | All UI elements must be keyboard-navigable, screen-reader-friendly, and meet WCAG 2.1 AA standards. |
| **Community** | Clear contribution paths, comprehensive documentation, and a responsive maintenance cadence. |
| **Cross-Platform** | Consistent experience across Chrome, Firefox, Edge, and userscript managers (Tampermonkey, Violentmonkey). |

## Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Supporting platforms other than Codeforces | Codeforces is the sole target. Scope creep into other judges dilutes focus. |
| React/Vue/Svelte rewrite | The custom JSX pragma (`dom.element`) is lightweight and sufficient. A framework migration would add complexity without proportional benefit. |
| Manifest V3 migration in the short term | MV3 imposes service worker restrictions that break the current MPH architecture. Migration will be carefully planned when the ecosystem matures. |
| Native mobile app | The target environment is desktop browsers. Mobile Codeforces usage is minimal among the target audience. |
| Monetization | BetterCF is free and open source. No premium tiers, no ads, no telemetry. |
| Real-time collaboration features | Out of scope. The extension enhances individual browsing, not multi-user workflows. |
| Codeforces API client library | The extension consumes the CF API directly. A separate library would be over-engineering. |
| Global state management library (Redux, MobX) | The in-memory event bus (`helpers/events.js`) is simple and sufficient for current needs. |
| CSS-in-JS | Separate CSS files keep styling accessible, overridable, and debuggable. |
| Internationalization (i18n) | The target audience is English-reading competitive programmers. i18n adds significant complexity. |

## Success Metrics

| Metric | Target |
|--------|--------|
| Page load overhead | < 50ms added to DOMContentLoaded |
| Memory footprint | < 10 MB additional heap usage |
| Bundle size (extension) | < 100 KB gzipped |
| Bundle size (userscript) | < 80 KB gzipped |
| Open issues response time | < 7 days |
| Release cadence | Monthly patch, quarterly feature |
| Test coverage (future) | > 80% for core modules |
