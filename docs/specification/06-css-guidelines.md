# CSS Guidelines

## Class Naming

All BetterCF-created elements must use the `bettercf-` prefix.

### Naming Pattern

```
bettercf-{component}-{variant}
```

| Pattern | Example | Element |
|---------|---------|---------|
| `.bettercf-{component}` | `.bettercf-modal` | Modal container |
| `.bettercf-{component}-{variant}` | `.bettercf-modal-inner` | Modal inner content |
| `.bettercf-{component}-{state}` | `.bettercf-navbar-item:hover` | Hover state |
| `.bettercf-{state}` | `.bettercf-hidden` | Common state |

### Prefix Rules

- Every BetterCF class starts with `bettercf-`. This avoids collisions with Codeforces' own classes.
- Internal implementation details use an additional prefix: `bettercf-tutorial-btn`, `bettercf-config-btn`.
- The prefix is never abbreviated. Not `bcf-`, not `btcf-`.

## Design Tokens

For consistency, use the following token values in new CSS. Existing CSS may be migrated incrementally.

| Token | Value | Usage |
|-------|-------|-------|
| `--bettercf-blue` | `#2c63d5` | Primary interactive color |
| `--bettercf-blue-dark` | `#1a3d8f` | Hover state |
| `--bettercf-accent` | `#188ecd` | Toggle active, focus ring |
| `--bettercf-text` | `#212121` | Primary text |
| `--bettercf-text-light` | `#9E9E9E` | Secondary text |
| `--bettercf-bg` | `#ffffff` | Card/page background |
| `--bettercf-bg-dark` | `#121212` | Dark mode background |
| `--bettercf-border` | `#7f7f7f52` | Subtle borders |
| `--bettercf-shadow` | `1px 1px 5px rgba(108,108,108,0.17)` | Card shadows |
| `--bettercf-radius` | `6px` | Border radius |
| `--bettercf-font` | `'Libre Franklin', 'Roboto', sans-serif` | Primary font |
| `--bettercf-font-mono` | `monospace` | Code font |

### Migration

New CSS should use `var(--bettercf-*)` custom properties where practical, but the current CSS files do not use CSS custom properties. Adding them is not a priority. Consistency with surrounding code takes precedence over abstract purity.

## Dark Theme

Dark mode is implemented via a CSS filter on `<html>`:

```css
html.bettercf-dark-mode {
    filter: invert(1) hue-rotate(180deg);
}

html.bettercf-dark-mode img:not(.inverted) {
    filter: none !important;
}
```

### Rules for Dark Mode

- New UI elements must be tested in both light and dark modes.
- Elements that should not be inverted (images, videos) must use the `.inverted` class.
- Custom dark backgrounds (e.g., the popup) use `#121212` -- they are not inverted.
- Do not add dark mode variants for BetterCF-created elements. The filter handles them automatically.

## Spacing

- Use `em` and `rem` for relative spacing. Avoid `px` except for borders and shadows.
- Standard spacing scale: 0.25em, 0.5em, 0.75em, 1em, 1.5em, 2em.
- Padding inside modals: `2em`.
- Margin between form elements: `0.5em`.

## Animations

- Use CSS animations, not JavaScript-driven animations.
- Duration: `0.15s` for micro-interactions (fade in, toggle). `0.2s` for transitions.
- Easing: `ease` or `ease-out`. Avoid `linear` and `ease-in`.
- Respect `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
    .bettercf-modal {
        animation: none;
    }
}
```

## Responsive Rules

- The primary target is desktop viewports (1024px+).
- The popup is fixed at 256px width. No responsive adjustments needed.
- Modals should cap at `60vw` width on desktop and `90vw` on small viewports.
- The finder should cap at `60vw` width with a `max-height` of `75vh` to avoid overflow.

```css
.bettercf-modal-inner {
    width: 60vw;
    max-height: 80vh;
}

@media (max-width: 768px) {
    .bettercf-modal-inner {
        width: 90vw;
    }
}
```

## Specificity

- Use class selectors exclusively. Never ID selectors in CSS (IDs are for JavaScript hooks).
- Avoid `!important` except when overriding Codeforces' own `!important` rules.
- Prefer descendant selectors over chained classes: `.bettercf-modal-inner > label` over `label.bettercf-label`.
- Keep specificity flat. Avoid `#id .class .child` patterns.
