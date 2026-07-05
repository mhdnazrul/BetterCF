# BetterCF Development Specification

This directory defines the forward-looking development specification for BetterCF. Unlike the technical documentation in `docs/`, which describes the current codebase as it exists today, this specification defines **how BetterCF should evolve** over the coming years.

## Documents

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Project Vision](./01-project-vision.md) | Purpose, vision, long-term goals, and explicit non-goals |
| 02 | [Design Principles](./02-design-principles.md) | Core principles that guide all development decisions |
| 03 | [Project Architecture](./03-project-architecture.md) | Architecture philosophy and modularity guidelines |
| 04 | [Folder Conventions](./04-folder-conventions.md) | Where future files belong and how to organize new features |
| 05 | [Coding Standards](./05-coding-standards.md) | JavaScript style, naming, imports, error handling, async rules |
| 06 | [CSS Guidelines](./06-css-guidelines.md) | Class naming, design tokens, dark theme, responsive rules |
| 07 | [Feature Development Guide](./07-feature-development-guide.md) | Required lifecycle for every new feature |
| 08 | [UI Guidelines](./08-ui-guidelines.md) | Visual language, spacing, typography, colors, dialogs |
| 09 | [Performance Guidelines](./09-performance-guidelines.md) | DOM access, caching, debouncing, memory, budgets |
| 10 | [Testing Guidelines](./10-testing-guidelines.md) | Manual testing, future automated testing, regression checklist |
| 11 | [Versioning Policy](./11-versioning-policy.md) | SemVer, commit naming, release checklist |
| 12 | [Roadmap](./12-roadmap.md) | Near-term, mid-term, long-term goals |

## How to Use This Specification

- **New features**: Read 07 first, then 04, then 05, then 06
- **Code reviews**: Reference 05, 06, and 09
- **Architecture decisions**: Reference 02, 03, and 09
- **Releases**: Follow 11
- **Planning**: Reference 12

## Relationship to Existing Documentation

The documents in `docs/` describe the codebase as it is. The documents in `docs/specification/` describe the codebase as it should become. When contributing, follow the specification for new code, and refer to existing docs for understanding current behavior.
