# Feature Development Guide

## Required Lifecycle

Every feature module must implement the following lifecycle. This contract is enforced by convention and code review, not by the build system.

### `install()`

**Required.** Called when the feature is first activated.

- Must be wrapped in `env.ready()` to ensure DOM availability.
- Must guard early (check page type, check required elements, check config).
- Must not throw. Errors must be caught and logged.
- Must be idempotent if called multiple times (check if already installed).

```javascript
export const install = env.ready(function() {
    if (!shouldInstall()) return;
    if (alreadyInstalled) return;
    // Feature logic
    alreadyInstalled = true;
});
```

### `uninstall()`

**Optional but strongly recommended.** Called when the feature's config is toggled off.

- Must remove all DOM elements created by the feature.
- Must remove all event listeners added by the feature (using named functions or `AbortController`).
- Must restore any global state that was modified.
- Must be idempotent if called when already uninstalled.

```javascript
export function uninstall() {
    if (!createdElement) return;
    createdElement.remove();
    createdElement = null;
}
```

### `init()`

**Optional.** Called once per page load for one-time setup that must happen before `install()`.

- Used for proxying global functions or subscribing to external pubsub.
- Must be idempotent (guard with a `ready` flag).

```javascript
let initialized = false;
export function init() {
    if (initialized) return;
    initialized = true;
    // One-time setup
}
```

### `update()`

**Optional.** Called imperatively when the feature needs to refresh its state without a full reinstall.

- Used for features with external triggers (e.g., standings updates).
- Must be safe to call when the feature is not installed (no-op in that case).

## Configuration

### Adding a Config Key

1. Add a default value in `src/env/config.js` `defaultConfig` object.
2. Add a UI entry in `src/env/config_ui.js` `configProps` array.
3. Wire the module in `src/index.js` by adding `[module, 'configKey']` to the `modules` array.
4. The core automatically calls `install()`/`uninstall()` when the config value changes.

### Config Key Rules

- Use camelCase names. `showTags`, not `show_tags`, not `ShowTags`.
- Boolean keys default to `true` (opt-out features) or `false` (opt-in features).
- Numeric keys default to `0` (disabled) with positive values enabling the feature.
- String keys (select dropdowns) default to the first option.

### Config Change Propagation

When a config value changes:

1. The core fires `events.fire(configKey, newValue)`.
2. The config callback (registered in `index.js`) calls `module.install()` or `module.uninstall()`.
3. In extension mode, the popup sends the change to all tabs via `tabs.sendMessage`.
4. The injected script receives the change via the MPH and fires the same event.

Modules should not call `config.set()` themselves during `install()`/`uninstall()` to avoid infinite loops. Use `events.listen()` for reactive updates instead.

## Events

### Firing Events

Use `events.fire(eventName, data)` for cross-module communication. Event names should be descriptive:

- Config changes: Use the config key name (`'darkTheme'`, `'showTags'`).
- System events: Use quoted phrases (`'standings updated'`, `'request config change'`).

### Listening to Events

Use `events.listen(eventName, callback)` in `install()`. The callback should be a named function so it can be removed (not an anonymous arrow function).

```javascript
function onStandingsUpdated() {
    refreshTwinStandings();
}

export const install = env.ready(function() {
    events.listen('standings updated', onStandingsUpdated);
});
```

### Cleanup

If your module listens to events, those listeners persist after `uninstall()`. Either:
- Guard the callback with a check that the module is still installed, or
- Remove the listener in `uninstall()` (not currently supported by the event bus; add this when needed).

## Module File Template

```javascript
/**
 * @file One-line description of the feature
 */

import dom from '../helpers/dom';
import env from '../env/env';
import * as config from '../env/config';
import * as events from '../helpers/events';

let installed = false;

function onConfigChange(value) {
    if (installed) {
        updateFeature(value);
    }
}

export const install = env.ready(function() {
    if (installed) return;
    if (!config.get('myFeature')) return;
    if (!dom.$('.required-element')) return;

    // Feature logic

    events.listen('myFeature', onConfigChange);
    installed = true;
});

export function uninstall() {
    if (!installed) return;

    // Cleanup
    installed = false;
}
```

## Error Isolation

The core wraps every `module.install()` in `tryCatch` so one failure never blocks another. Do not rely on this for normal error handling -- catch your own errors.

```javascript
export const install = env.ready(function() {
    try {
        // Potentially failing code
    } catch (err) {
        console.error(`MyFeature: install failed`, err);
    }
});
```
