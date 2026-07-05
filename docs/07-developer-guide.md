# Developer Guide

## How to Add a New Feature

### Step 1: Create the Feature Module

Create `src/ext/your_feature.js` following this template:

```javascript
import dom from '../helpers/dom';
import env from '../env/env';
import * as config from '../env/config';

export const install = env.ready(function() {
    // 1. Guard: check if this page needs the feature
    if (!location.pathname.includes('/target-page')) return;
    if (!dom.$('.required-element')) return;
    
    // 2. Use JSX to create DOM elements
    let button = (
        <button className="bettercf-my-btn" onClick={handler}>
            My Feature
        </button>
    );
    
    // 3. Append to DOM
    dom.$('.target-container').appendChild(button);
    
    // 4. Bind any additional event listeners
    dom.on(document, 'some-event', handler);
});

export function uninstall() {
    // Remove created elements
    let btn = dom.$('.bettercf-my-btn');
    if (btn) btn.remove();
    
    // Clean up
    // Note: can't easily remove anonymous event listeners
}
```

### Step 2: Register the Feature in `index.js`

**A.** Add the import at the top of `src/index.js`:

```javascript
import * as my_feature from './ext/my_feature';
```

**B.** Add to the `modules` array (choose one):

```javascript
// Config-gated feature (boolean toggle, number, or select):
[my_feature, 'myConfigKey'],

// Always-installed feature (no config toggle):
[my_feature, ''],
```

**C.** Add the name to the `moduleNames` array (used for error logging):

```javascript
let moduleNames = [ /* ...existing... */, 'my_feature' ];
```

### Step 3: If Config-Gated, Add Configuration

**A.** Add a default value in `src/env/config.js`:

```javascript
defaultConfig: {
    // ...existing keys...
    myConfigKey: true,   // or false, or 0, or "default"
}
```

**B.** Add a UI prop in `src/env/config_ui.js`:

```javascript
configProps = [
    // ...existing props...
    prop('My Feature Description', 'toggle', 'myConfigKey'),
];
```

Available prop types:
- `'toggle'` — boolean checkbox
- `'number'` — numeric input
- `'select'` — dropdown (requires 4th argument: array of options)
- `'text'` — text input

### Step 4 (Optional): Add a Keyboard Shortcut

**A.** Add shortcut prop in `src/env/config_ui.js`:

```javascript
shortcutProps = [
    // ...existing...
    scProp('My Feature', 'myShortcut'),
];
```

**B.** Add default binding in `src/env/config.js`:

```javascript
shortcuts: {
    // ...existing...
    myShortcut: 'Ctrl+Shift+M',
}
```

**C.** Add handler mapping in `src/ext/shortcuts.js` `id2Fn`:

```javascript
const id2Fn = {
    // ...existing...
    myShortcut: () => myAction(),
};
```

---

## How to Remove an Existing Feature

### For Config-Gated Features

1. Remove the `[module, configKey]` entry from the `modules` array in `index.js`
2. Remove the import line from `index.js`
3. Remove the config key from `defaultConfig` in `env/config.js`
4. Remove the UI prop from `configProps` in `env/config_ui.js`
5. Delete the source file from `src/ext/`

### For Always-Installed Features

1. Remove the `[module, '']` entry from the `modules` array in `index.js`
2. Remove the import line from `index.js`
3. Delete the source file from `src/ext/`

### Important Considerations

- **Dependency check**: Ensure no other module imports the feature you are removing. Check all imports in `ext/*.js`, `helpers/*.js`, and `index.js`.
- **CSS cleanup**: Remove any feature-specific CSS from `src/common.css`.
- **Event bus cleanup**: Ensure no other code fires or listens to events the feature used.
- **Storage migration**: Existing users will have stale config keys in their `localStorage` and `chrome.storage.sync`. Consider adding a migration step or simply ignoring unknown keys (the system already handles this via `Object.assign({}, defaultConfig, config)` — unknown keys in saved config are preserved but unused).

---

## Architecture Rules to Follow

### 1. Module Pattern

Every feature module MUST export:
- `install()` — required. The initialization function.
- `uninstall()` — optional (but recommended for config-gated features). The cleanup function.
- `init()` — optional. For idempotent one-time initialization.

### 2. DOM Readiness

Feature install functions should be wrapped in `env.ready()` to ensure the DOM exists before manipulation:

```javascript
export const install = env.ready(function() {
    // DOM is guaranteed to be ready here
});
```

### 3. Self-Containment

A feature should only depend on:
- `helpers/dom` — DOM queries and creation
- `helpers/events` — event bus (optional)
- `env/config` — configuration access
- `env/env` — environment utilities (ready, userHandle)
- `helpers/Functional` — functional utilities

Avoid cross-feature imports. The only exception is `shortcuts.js` importing `finder.js`.

### 4. CSS Class Prefix

All BetterCF-created elements use the `bettercf-` prefix in class names:

| Class | Used By |
|-------|---------|
| `.bettercf-hidden` | Common — display: none |
| `.bettercf-config-btn` | config.js — [++] settings button |
| `.bettercf-config` | config.js — settings modal |
| `.bettercf-modal` | Common — modal overlay |
| `.bettercf-modal-inner` | Common — modal content area |
| `.bettercf-modal-background` | Common — modal backdrop |
| `.bettercf-tutorial` | show_tutorial.js |
| `.bettercf-tutorial-btn` | show_tutorial.js |
| `.bettercf-navbar` | navbar.js |
| `.bettercf-navbar-item` | navbar.js |
| `.bettercf-dropdown` | navbar.js |
| `.bettercf-dark-mode` | dark_theme.js (on `<html>`) |
| `.bettercf-style` | style.js (on `<style>`) |
| `.bettercf-twin-standings` | standings/twin.js |

### 5. JSX for UI Creation

Use the custom JSX syntax for all DOM creation. Do not use `innerHTML`:

```javascript
// CORRECT:
let btn = <button className="bettercf-btn" onClick={handler}>Text</button>;

// INCORRECT:
let btn = document.createElement('button');
btn.className = 'bettercf-btn';
btn.innerText = 'Text';
```

### 6. Event Bus for Cross-Cutting Concerns

If other features need to react to your feature's state changes:

```javascript
// Fire an event
import * as events from '../helpers/events';
events.fire('myFeatureChanged', { someData: true });

// Listen for an event (in another module)
events.listen('myFeatureChanged', data => {
    console.log(data.someData);
});
```

### 7. Config Key Naming

Use camelCase for config keys:

```javascript
// CORRECT:
prop('My Setting', 'toggle', 'mySettingName');

// INCORRECT:
prop('My Setting', 'toggle', 'my_setting_name');
prop('My Setting', 'toggle', 'mySettingName');
```

### 8. Storage Access

Use the config API instead of directly accessing `localStorage`:

```javascript
// CORRECT:
if (config.get('darkTheme')) { ... }
config.set('darkTheme', true);
config.toggle('darkTheme');

// INCORRECT:
if (JSON.parse(localStorage.bettercf).darkTheme) { ... }
```

Exception: Feature-specific local data (e.g., finder priority in `localStorage.finderPriority`).

### 9. Guard Clauses

Return early if the current page does not need the feature:

```javascript
export const install = env.ready(function() {
    // Page guard
    if (!location.pathname.includes('/contest')) return;
    
    // Element guard
    if (!dom.$('.required-selector')) return;
    
    // Config guard
    if (!config.get('myConfig')) return;
    
    // ... feature logic
});
```

### 10. Cleanup

If your feature modifies global state (proxies functions, subscribes to external pubsub):

```javascript
let originalFunction;
let originalSubscription;

export function init() {
    // Save original
    originalFunction = env.global.Codeforces.someFunction;
    
    // Proxy
    env.global.Codeforces.someFunction = function(...args) {
        // ... interception logic
        return originalFunction.apply(this, args);
    };
}

export function uninstall() {
    // Restore original
    if (originalFunction) {
        env.global.Codeforces.someFunction = originalFunction;
    }
    // Note: external subscriptions may be impossible to unsubscribe
}
```
