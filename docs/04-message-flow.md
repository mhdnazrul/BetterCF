# Message Flow

## Overview

The extension uses a **three-layer message passing architecture** involving four execution contexts:

1. **Popup** → sends config changes to all Codeforces tabs via `browser.tabs.sendMessage`
2. **Background** → relays config propagation between contexts
3. **Content Script** → bridges the isolated world and the page context via `window.postMessage`
4. **Injected Script** → communicates with content script via MPH (Message-Passing Hell)

```mermaid
flowchart LR
    subgraph Extension Contexts
        POPUP[Popup<br/>popup.js]
        BG[Background<br/>background.js]
        CS[Content Script<br/>contentScript.js]
        IS[Injected Script<br/>index.js]
    end
    
    POPUP -- "browser.tabs.sendMessage" --> CS
    CS -- "browser.runtime.sendMessage" --> BG
    BG -- "browser.tabs.sendMessage" --> CS
    CS -- "window.postMessage" --> IS
    IS -- "window.postMessage" --> CS
    POPUP -- "browser.storage.sync.set" --> STORAGE[(chrome.storage.sync)]
    CS -- "browser.storage.sync.get/set" --> STORAGE
```

---

## Message Types

| Type | Direction | Payload | Purpose |
|------|-----------|---------|---------|
| `get storage` | IS → CS | `{ key }` | Read from `chrome.storage.sync` |
| `set storage` | IS → CS | `{ key, value }` | Write to `chrome.storage.sync` |
| `propagate config` | IS → CS → BG | `{ key, value }` | Broadcast config to all tabs |
| `config change` | POPUP → CS → IS | `{ id, value }` | Push config change from popup |
| `config change` | BG → CS → IS | `{ id, value }` | Push config change from background relay |
| `bg result` | CS → IS | `{ id, result }` | Response from storage/background operations |
| `error` | CS → IS | `{ id, error }` | Error response from storage/background |

---

## Message Flow: Popup Config Change

This is the most common message flow — a user changes a setting in the popup.

```mermaid
sequenceDiagram
    participant User
    participant POPUP as Popup (popup.js)
    participant CS as Content Script (Tab X)
    participant IS as Injected Script (Tab X)
    participant MOD as Feature Module
    participant STORAGE as chrome.storage.sync

    User->>POPUP: Toggle setting
    POPUP->>POPUP: pushChange('darkTheme', true)
    POPUP->>POPUP: events.fire('darkTheme', true) — updates checkbox UI
    
    POPUP->>CS: browser.tabs.query({ url: '*://codeforces.com/*' })
    POPUP->>CS: tabs.sendMessage({ type: 'config change', to: 'is', id: 'darkTheme', value: true })
    
    CS->>CS: browser.runtime.onMessage received
    CS->>IS: window.postMessage({ type: 'config change', to: 'is', id: 'darkTheme', value: true }, window.origin)
    
    IS->>IS: MPH receives message
    IS->>IS: events.fire('request config change', { id: 'darkTheme', value: true })
    IS->>IS: config.js listener: config['darkTheme'] = true
    IS->>IS: events.fire('darkTheme', true)
    IS->>MOD: dark_theme.install() — adds bettercf-dark-mode class to <html>
    
    POPUP->>STORAGE: browser.storage.sync.set({ bettercf: config })
```

---

## Message Flow: Injected Script Storage Read

```mermaid
sequenceDiagram
    participant IS as Injected Script
    participant MPH as MPH (env-extension.js)
    participant CS as Content Script
    participant STORAGE as chrome.storage.sync

    IS->>MPH: storage.get('bettercf')
    MPH->>MPH: Generate unique ID: 42
    MPH->>MPH: Store resolver: mph.resolvers[42] = resolve
    MPH->>CS: window.postMessage({ type: 'get storage', key: 'bettercf', id: 42, to: 'cs' }, '*')
    
    CS->>CS: window 'message' listener fires
    CS->>CS: Filter: e.origin === window.origin, e.data.to === 'cs'
    CS->>STORAGE: browser.storage.sync.get(['bettercf'])
    STORAGE-->>CS: { bettercf: { darkTheme: true, ... } }
    
    CS->>IS: window.postMessage({ type: 'bg result', id: 42, result: { bettercf: { ... } }, to: 'is' }, window.origin)
    
    IS->>MPH: window 'message' listener fires
    IS->>MPH: Filter: e.origin === window.origin, e.data.to === 'is', e.data.type === 'bg result'
    IS->>MPH: mph.resolvers[42](result) — resolves promise
    IS-->>IS: storage.get('bettercf') resolves with { bettercf: { ... } }
```

---

## Message Flow: Injected Script Config Propagation

```mermaid
sequenceDiagram
    participant IS as Injected Script
    participant MPH as MPH (env-extension.js)
    participant CS as Content Script
    participant BG as Background Script
    participant CS2 as Content Script (Tab Y)
    participant IS2 as Injected Script (Tab Y)

    IS->>MPH: storage.propagate('darkTheme', true)
    MPH->>CS: window.postMessage({ type: 'propagate config', key: 'darkTheme', value: true, id: 43, to: 'cs' }, '*')
    
    CS->>CS: Rewrite to: 'bg'
    CS->>BG: runtime.sendMessage({ type: 'propagate config', key: 'darkTheme', value: true, id: 43, to: 'bg' })
    
    BG->>BG: Query all tabs: url === '*://codeforces.com/*'
    BG->>CS2: tabs.sendMessage({ type: 'config change', to: 'is', id: 'darkTheme', value: true })
    BG-->>CS: Return { id: 43, to: 'is', type: 'bg result' }
    
    CS2->>IS2: window.postMessage({ type: 'config change', to: 'is', id: 'darkTheme', value: true }, window.origin)
    IS2->>IS2: MPH receives → fires 'request config change' → feature toggles
```

---

## MPH (Message-Passing Hell) System

The MPH is a request-response system built on top of `window.postMessage`. Defined in `src/env/env-extension.js`.

### MPH Architecture

```
mph = {
    resolvers: {           // Map of pending request IDs to Promise resolvers
        42: resolveFn,     
        43: resolveFn      
    },
    genID: function(),     // Auto-incrementing ID generator
    initialized: false,    // Guard for init() idempotency
    send: function(),      // Send a message and return Promise
    init: function()       // Register the window message listener
}
```

### Send Flow

1. `mph.send(message)` is called
2. Generates a new unique ID via `genID`
3. Stores `message.id = id` and sets `message.to = 'cs'`
4. Stores `this.resolvers[id] = resolve` (Promise resolver)
5. Calls `window.postMessage(message, '*')`
6. Starts a 20-second timeout (rejects if no response)
7. Returns a Promise

### Receive Flow

1. `window.addEventListener('message', ...)` fires
2. Filters: `e.origin === window.origin && e.data.to === 'is'`
3. Checks `e.data.type`:
   - `'bg result'`: Resolves the stored resolver with `e.data.result`, deletes from `resolvers` map
   - `'config change'`: Fires `events.fire('request config change', { id, value })`

### Security Note

The MPH uses `window.postMessage(message, '*')` with a wildcard target origin. This is noted as a security consideration — the `origin` check happens on the receiving end (`e.origin === window.origin`), but the `*` target allows any window to receive the message.
