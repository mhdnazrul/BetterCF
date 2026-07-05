# Coding Conventions

## JavaScript Conventions

### Import Style

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `import * as name` | Importing a module with multiple named exports | `import * as config from './env/config'` |
| `import default` | Importing a single default export | `import dom from '../helpers/dom'`<br/>`import env from '../env/env'` |
| `import { named }` | Importing specific named functions | `import { safe, once } from '../helpers/Functional'` |
| `import default as name` | Importing CSS (default export as named) | `import commonCSS from '../common.css'` |

### Export Style

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `export const name = ...` | Exporting a function expression | `export const install = env.ready(function() { ... })` |
| `export function name()` | Exporting a function declaration | `export function uninstall() { ... }` |
| `export default { ... }` | Exporting a utility object | `export default { $, $$, on, element, ... }` |
| `export let name = ...` | Exporting a mutable binding | `export let configProps = [ ... ]` |

### Naming Conventions

| Convention | Applies To | Examples |
|------------|-----------|----------|
| **camelCase** | Variables, functions, properties | `getTutorialHTML`, `injectedCustomStyle`, `sendChangeToInjected` |
| **PascalCase** | Component functions | `ShowTagsButton`, `Config`, `Toggle`, `Select`, `Shortcut` |
| **UPPER_SNAKE_CASE** | None in current code | (not used) |
| **snake_case** | Source filenames | `dark_theme.js`, `change_page_title.js`, `search_button.js`, `show_tutorial.js` |
| **kebab-case** | CSS class names (with `bettercf-` prefix) | `bettercf-hidden`, `bettercf-dark-mode`, `bettercf-modal-inner` |

### Formatting

- **Semicolons**: Required at end of statements
- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings (`'string'`)
- **Equality**: Strict equality (`===` and `!==`)
- **Trailing commas**: Not used in arrays/objects
- **Async pattern**: `async`/`await` or `.then()` chains

---

## JSX / Component Conventions

### JSX Pragmas

Configured in `.babelrc`:
```json
{
  "pragma": "dom.element",
  "pragmaFrag": "dom.fragment"
}
```

JSX is transpiled to `dom.element()` calls:
```javascript
// JSX source:
<button className="caption" onClick={handler}>Text</button>

// Transpiled to:
dom.element('button', { className: 'caption', onClick: handler }, 'Text')
```

### Component Rules

- Component functions are **capitalized**: `function Toggle(props) { ... }`
- Components receive a single `props` object
- Props use **camelCase** (JSX converts them to DOM attributes)
- Event handler props use React naming: `onClick`, `onChange`, `onInput`, `onKeyDown`
- Children are passed as rest parameters to `dom.element()`

### Component Example

```javascript
function MyComponent({ title, onClick }) {
    return (
        <div className="bettercf-component">
            <span onClick={onClick}>{title}</span>
        </div>
    );
}
```

---

## Module Pattern

### Feature Module Template

```javascript
import dom from '../helpers/dom';
import env from '../env/env';
import * as config from '../env/config';

// Always wrap install in env.ready
export const install = env.ready(function() {
    // Guards at top
    if (!config.get('myFeature')) return;
    if (!location.pathname.includes('/target')) return;
    if (!dom.$('.required-element')) return;
    
    // Feature logic using JSX
    let el = <div className="bettercf-my-class">...</div>;
    dom.$('.container').appendChild(el);
});

// Uninstall is exported as a function declaration
export function uninstall() {
    let el = dom.$('.bettercf-my-class');
    if (el) el.remove();
}
```

### Module Export Patterns

```javascript
// Pattern 1: Named exports
export const install = ...;
export function uninstall() { ... }

// Pattern 2: Additional exports
export function init() { ... }      // Idempotent init
export function custom() { ... }   // Special-purpose
export async function common() { ... }

// Pattern 3: Default export (for utility objects)
export default {
    $(query, element) { ... },
    $$(query, element) { ... },
    on(element, event, handler) { ... }
};
```

---

## CSS Conventions

### Naming

- All BetterCF classes are prefixed with `bettercf-`
- Use kebab-case: `.bettercf-modal-inner`, `.bettercf-dark-mode`, `.bettercf-config-btn`
- Class names describe the component, not the appearance

### Selector Specificity

```css
/* Use class selectors, not ID selectors */
.bettercf-modal { ... }

/* Use descendant selectors where appropriate */
.bettercf-modal-inner > label { ... }

/* Use !important sparingly — only when overriding Codeforces' own !important */
.spoilered-mashup ._MashupContestEditFrame_tags.notice {
    color: black !important;
}
```

### Dark Mode

Dark mode is implemented via CSS filter on `<html>`:
```css
html.bettercf-dark-mode {
    filter: invert(1) hue-rotate(180deg);
}
```

Elements that should not be inverted use the `.inverted` class:
```css
html.bettercf-dark-mode img:not(.inverted) {
    filter: none !important;
}
```

---

## Event Bus Conventions

### Events Module (`helpers/events.js`)

```javascript
// Listen for an event
events.listen('eventName', data => {
    // handle event
});

// Fire an event (returns Promise.all of all listener results)
await events.fire('eventName', someData);
```

### Event Naming

- Config change events use the config key name: `'darkTheme'`, `'showTags'`, `'standingsItv'`
- System events use descriptive names: `'standings updated'`, `'request config change'`, `'shortcuts'`

### Config Change Event Flow

```javascript
// Register a callback for a config key
events.listen('myConfigKey', value => {
    if (value === true || value === false) {
        value ? feature.install() : feature.uninstall();
    } else {
        feature.uninstall();
        feature.install(value);
    }
});
```

---

## Build System Conventions

### Environment Variables

| Variable | Values | Usage |
|----------|--------|-------|
| `process.env.TARGET` | `'extension'` / `'userscript'` | Selects environment implementation |
| `process.env.NODE_ENV` | `'development'` / `'production'` | Controls minification, logging, profiling |
| `process.env.VERSION` | package.json version | Version string injected at build time |

### Guard Conditions

```javascript
// Target-specific code
if (process.env.TARGET == 'extension') { ... }

// Development-only code
if (process.env.NODE_ENV == 'development') {
    console.time('[BetterCF] operation');
}
```

### Comment Style

- `/** @file Description */` — File header comments
- `/** ... */` — JSDoc-style function documentation (sparse)
- `//` — Inline comments
- `// TODO:` — Known issues or planned work
- `// FIXME:` — Known bugs

Example:
```javascript
/**
 * @file Provides drowdown menus for the main navbar, for better site navigation
 */

// TODO: make it a fetch()

// FIXME: cf-predictor deltas dissapear after reloading standings
```
