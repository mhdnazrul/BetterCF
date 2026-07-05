# Versioning Policy

## Semantic Versioning

BetterCF follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

| Bump | When | Example |
|------|------|---------|
| **MAJOR** | Breaking change to storage keys, CSS class names, or minimum browser requirements. | `2.0.0` → `3.0.0` |
| **MINOR** | New feature, new config option, new supported environment. | `2.4.1` → `2.5.0` |
| **PATCH** | Bug fix, performance improvement, documentation update. | `2.4.1` → `2.4.2` |

### Pre-release Tags

- `-alpha.N` — Internal testing, may break at any time.
- `-beta.N` — Feature-complete, testing for release.
- `-rc.N` — Release candidate, final testing before publish.

## Version Sources

The canonical version is in `package.json`. It propagates to:

| File | Mechanism |
|------|-----------|
| `package.json` | Authoritative source |
| `manifest.json` (generated) | Read from `package.json` at build time |
| `meta.js` | `{{VERSION}}` placeholder replaced at build time |
| `env/config.js` | `process.env.VERSION` injected by Rollup |
| `popup.js` | `process.env.VERSION` (via rollup-plugin-inject-process-env) |

The version is never hardcoded in more than one place.

## Commit Naming

### Format

```
type(scope): description
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or config option |
| `fix` | Bug fix |
| `perf` | Performance improvement |
| `refactor` | Code restructuring with no behavior change |
| `docs` | Documentation changes |
| `style` | Code formatting (whitespace, semicolons) |
| `chore` | Build config, dependencies, tooling |
| `test` | Adding or updating tests |
| `ci` | CI/CD configuration |

### Scope

The scope is the module or area affected:

- `ext/dark_theme`, `ext/finder`, `env/config`, `helpers/dom`, `common.css`, etc.
- For cross-cutting changes: `core`, `build`, `docs`, `spec`.

### Examples

```
feat(ext/finder): add fuzzy search to problem navigation
fix(env/config): handle null localStorage value on fresh install
perf(ext/standings): cache API response to reduce network calls
refactor(ext/shortcuts): extract shortcut parsing to functional helper
docs(spec/01): add non-goal for mobile app support
chore(build): update rollup to v4
```

### Breaking Changes

Add `BREAKING CHANGE:` in the commit body:

```
refactor(storage)!: rename config key standingsItv to standingsInterval

BREAKING CHANGE: The `standingsItv` config key has been renamed to
`standingsInterval`. Existing configurations will not carry over.
```

The `!` after the scope/type is optional but recommended.

## Changelog

Maintain a `CHANGELOG.md` in the repository root following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

### Format

```markdown
# Changelog

## [2.5.0] - 2026-07-15

### Added
- New feature: dark mode toggle now supports scheduled activation
- Config option `darkModeSchedule` with values "always", "never", "sunset-to-sunrise"

### Fixed
- Finder modal not closing on Escape when input is focused
- Twin standings container not removed on config toggle off

### Changed
- Performance: reduced DOM queries in standings update by 40%
```

## Release Checklist

### Before Release

- [ ] All manual tests pass (see `docs/specification/10-testing-guidelines.md`)
- [ ] No P1 or P2 open issues targeting this release
- [ ] `CHANGELOG.md` updated
- [ ] Version bumped in `package.json`
- [ ] Build passes: `npx rollup -c --environment NODE_ENV:production`
- [ ] Bundle sizes are within budget
- [ ] No `console.log` or `debugger` statements in production build
- [ ] All TODO/FIXME comments reviewed for release-blocking issues

### Release Process

1. Create a release branch: `release/vMAJOR.MINOR.PATCH`
2. Run final build and smoke test
3. Create a GitHub release with tag `vMAJOR.MINOR.PATCH`
4. Attach the following assets from `dist/`:
   - `extension/` — zipped as `bettercf-vMAJOR.MINOR.PATCH.zip`
   - `userscript/script.user.js`
   - `userscript/script.meta.js`
5. Publish to Chrome Web Store (upload `bettercf-vMAJOR.MINOR.PATCH.zip`)
6. Publish to Firefox Add-ons (upload `bettercf-vMAJOR.MINOR.PATCH.zip`)
7. Merge release branch into `main`
8. Post release notes in discussions / social media

### After Release

- [ ] Verify Chrome Web Store listing shows new version
- [ ] Verify Firefox Add-ons listing shows new version
- [ ] Verify userscript auto-update URL resolves to new version
- [ ] Monitor issue tracker for regression reports
- [ ] Create a GitHub milestone for the next release

## Deprecation Policy

- Config keys: When renaming a config key, keep the old key working for one MAJOR release cycle. Log a console warning when the old key is read.
- CSS classes: When renaming a CSS class, announce the change in the release notes. Keep the old class present (but unused) for one MINOR release.
- Features: When removing a feature, deprecate it in one MINOR release (feature still works but logs a warning), remove in the next MAJOR.
