# Changelog

All notable changes to BetterCF will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2026-07-06

### Changed
- **BREAKING**: Migrated extension from Manifest V2 to Manifest V3
- Background scripts now use Service Workers instead of persistent background pages
- Updated permissions structure (separated `permissions` and `host_permissions`)
- Updated extension icon handling (now in `action` instead of `browser_action`)
- Web accessible resources now use explicit URL patterns for enhanced security

### Added
- Full Manifest V3 support for Chrome and Chromium-based browsers
- Improved performance with service worker architecture
- Stricter security policies aligned with Chrome Web Store requirements

### Fixed
- Chrome Web Store compliance for MV3 requirements
- Security improvements through explicit resource matching

### Notes
- Firefox support continues on v1.x branch with Manifest V2
- All 15 features fully functional in MV3
- Userscript build unaffected by this migration

## [1.0.0] — 2026-07-06

### Added
- **First public stable release** of BetterCF.
- Complete rebranding from CodeforcesPP to BetterCF.
- Comprehensive technical documentation (13 docs covering architecture, development guides, and specifications).
- Professional open-source repository structure with CI/CD pipelines.
- GitHub community files: CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, SUPPORT.md.
- Dual-target build: Chrome/Firefox extensions (Manifest v2) and userscript (Tampermonkey/Violentmonkey/Greasemonkey).
- 15+ features including dark mode, navigation enhancements, shortcuts, standings auto-refresh, problem finder, and more.

### Changed
- Rebranded all user-facing assets and internal identifiers from CodeforcesPP to BetterCF.

## [2.4.1] — 2026-07-05

### Changed
- Rebranded from CodeforcesPP to BetterCF across all user-facing surfaces.
- Updated metadata, extension name, popup title, and documentation references.
- CSS classes renamed from `cfpp-*` to `bettercf-*`.
- Internal storage keys renamed from `cfpp_*` to `bettercf_*`.

### Added
- Specification documents in `docs/specification/` covering vision, architecture, and development guidelines.
- Repository quality tooling: `.editorconfig`, `.eslintrc.json`, `.prettierrc`.
- GitHub community files: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`.
- GitHub templates: PR template, feature request template, CODEOWNERS.
- CI workflow for build verification across Node.js 18/20/22.

## [2.4.0] — 2026-06-20

### Added
- The virtual contest feature was introduced.

## [2.3.0] — 2026-05-27

### Added
- New problem navigation features in the sidebar.

## [2.2.0] — 2026-04-15

### Added
- Quick rating predictions in the standings page.

## [2.1.0] — 2026-03-20

### Added
- Tutorial tabs available for Codeforces problems.

## [2.0.0] — 2025-09-21

### Added
- Initial manifest.json integration for Chrome and Firefox.
- Standings enhancement with rating changes and friend highlighting.
- Submission filtering and status highlighting.
- Popup UI for managing config and exports.
- Userscript build for non-extension use.
- Sidebar for virtual contests and problem analytics.
