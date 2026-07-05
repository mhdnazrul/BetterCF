# UI Guidelines

## Visual Language

BetterCF's UI should feel native to Codeforces. The goal is augmentation, not replacement.

- **Subtle**: BetterCF elements should not scream for attention. They blend into the page.
- **Consistent**: Use the same spacing, colors, and typography that Codeforces uses.
- **Minimal**: Every UI element must earn its place. If a feature can work without UI (e.g., automatic redirects), it should.

## Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Body text | Inherit from Codeforces | normal | inherit |
| Modal content | `'Libre Franklin', 'Roboto', sans-serif` | normal | 1em |
| Buttons | Inherit | 500 | 0.9em |
| Labels | Inherit | 400 | 1em |
| Config button (`[++]`) | Inherit | bold | 22px |

The custom fonts are loaded via `@font-face` in `style.js`. They only apply to BetterCF-injected content.

## Colors

BetterCF does not introduce its own color palette. It uses Codeforces' existing colors:

| Color | Codeforces Equivalent | Usage |
|-------|----------------------|-------|
| Blue | `#2c63d5` | Links, interactive elements |
| Dark blue | `#1a3d8f` | Link hover |
| Accent blue | `#188ecd` | Toggle active, focus rings |
| Dark text | `#212121` | Primary text |
| Gray text | `#9E9E9E` | Secondary/metadata |
| White | `#ffffff` | Card backgrounds |
| Light gray | `#f2f2f2` | Page background |

## Spacing

- **Margin/padding between elements**: `0.5em`
- **Modal inner padding**: `2em`
- **Button padding**: `0.4em 1.1em`
- **Finder input padding**: `1em 1.25em`
- **Dropdown padding**: `1em`

## Buttons

### Config Toggle Button (`[++]`)

- No visual style beyond the text itself.
- Positioned inline in the language chooser bar (userscript mode).
- No hover or active state changes (it's deliberately unobtrusive).

### Action Buttons

Used for "Show", "Tutorial", "Google It", etc.

- No background (transparent) with the standard Codeforces blue text.
- Hover: subtle underline or color darkening.
- The `.showTagsBtn`, `.bettercf-tutorial-btn`, `.searchBtn` classes follow this pattern.

### Submit Buttons

Used for form submissions ("Add all", "Start virtual contest").

- Light gray background: `#d2d2d245`
- Bottom border accent: `3px solid #b6b6b678`
- Rounded: `6px`
- Active state reduces bottom border to `1px` for a pressed effect.

## Panels

### Modals

- Fixed position, centered on viewport.
- Semi-transparent backdrop: `background: #00000087` (darkens in dark mode to `#ffffff87`).
- Inner content: white background, `2em` padding, `6px` border-radius, `60vw` max width, `80vh` max height.
- Fade in animation: `0.15s`.
- Close on `Escape` key and backdrop click.
- Focus is trapped inside the modal while open.

### Finder (Search Panel)

- Similar to a modal but positioned at `top: 8%` instead of vertically centered.
- Input has a blue focus shadow: `0 6px 19px #0b28667a`.
- Results list has a white background with hover highlighting.
- Arrow key navigation and Enter to select.

### Dropdown (Navbar)

- Absolute positioned below the parent nav item.
- Dark background: `#212121`.
- Light text: `#E0E0E0`.
- Box shadow for depth: `1px 7px 19px #00000054`.
- Hidden by default, shown on hover and focus-within.

### Dialogs

BetterCF currently has no native dialogs. It uses `Codeforces.showMessage()` for user notifications. This is intentional:

- Do not create custom toast/notification components. Codeforces' built-in messaging is sufficient.
- If a future feature needs a custom dialog, use the same modal pattern defined above with appropriate sizing.

## Icons

- The popup logo is the BetterCF SVG logo at 5rem width.
- The navbar uses the BetterCF PNG logo fetched from GitHub.
- No icon library (Font Awesome, Material Icons) is used. All icons are either text (`[++]`, `?`, `✓`) or the BetterCF logo.
- Future icons should use inline SVG or Unicode characters, not icon font libraries.

## Form Elements

### Toggles

- Hidden checkbox input with a styled `<span>` as the visual toggle.
- Active state: filled `#188ecd` circle.
- Inactive: empty circle with `#188ecd` border on `#eee` background.
- Transition: `0.2s`.

### Select Dropdowns

- Native `<select>` element, unstyled.
- No custom select dropdowns. Native selects are accessible and lightweight.

### Text Inputs (Shortcuts)

- Plain `<input type="text">` with no custom styling.
- The shortcut capture uses `onKeyDown` to record the key combination.
