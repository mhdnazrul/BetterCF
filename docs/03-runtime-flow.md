# Runtime Flow

## 1. How the Extension Starts from Browser Launch

The startup sequence differs between **extension mode** and **userscript mode**.

### Extension Mode

```mermaid
flowchart TD
    A[Browser Launch] --> B[Chrome loads extension via manifest.json]
    B --> C[Register content_scripts]
    B --> D[Create background event page]
    B --> E[Register browser action]
    
    C --> F["Run at: document_start<br/>Matches: *://codeforces.com/*<br/>JS: browser-polyfill.min.js, contentScript.js<br/>CSS: common.css"]
    D --> G["Scripts: browser-polyfill.min.js, background.js<br/>Persistent: false"]
    E --> H["Default popup: popup.html<br/>Default title: BetterCF"]
```

### Userscript Mode

```
Userscript Manager (Tampermonkey/Violentmonkey) loads script.user.js
  └─ Meta block (@match *://codeforces.com/*, @run-at document-start)
       ├─ Injects the entire bundled userscript as a single IIFE
       └─ All code runs inline in the page context (no separated content script / background)
```

---

## 2. Execution Flow — Background Script

### `background.js`

```mermaid
sequenceDiagram
    participant Browser
    participant BG as Background Script
    participant CS as Content Script (Tab A)
    participant CS2 as Content Script (Tab B)

    Browser->>BG: Create event page (on demand)
    Note over BG: Register runtime.onMessage listener
    
    CS->>BG: runtime.sendMessage({ to: 'bg', type: 'propagate config', key, value })
    BG->>BG: Check data.to === 'bg' && data.type === 'propagate config'
    BG->>BG: Query all tabs matching *://codeforces.com/*
    BG->>CS: tabs.sendMessage({ type: 'config change', to: 'is', id, value })
    BG->>CS2: tabs.sendMessage({ type: 'config change', to: 'is', id, value })
    BG-->>CS: Return Promise.resolve({ id, to: 'is', type: 'bg result' })
```

The background script is a **message relay only**. It has one responsibility: receive a 'propagate config' message and broadcast the config change to all open Codeforces tabs. It is a non-persistent event page (created on demand, destroyed when idle).

---

## 3. Execution Flow — Content Script

### `contentScript.js`

```mermaid
sequenceDiagram
    participant Page as Page Context
    participant CS as Content Script (Isolated World)
    participant BG as Background Script
    participant Storage as chrome.storage.sync

    Note over CS: document_start: browser-polyfill loads first
    Note over CS: contentScript.js executes in isolated world
    
    CS->>CS: Register window 'message' listener (from injected script)
    CS->>CS: Register browser.runtime.onMessage listener (from background)
    
    CS->>CS: Create <script src="chrome-extension://.../index.js">
    CS->>Page: Append script to DOM → index.js starts
    CS->>CS: Immediately remove the script element
    
    loop Message routing
        Page->>CS: window.postMessage({ type: 'get storage', key, id, to: 'cs' })
        CS->>Storage: browser.storage.sync.get([key])
        Storage-->>CS: result
        CS->>Page: window.postMessage({ type: 'bg result', id, result, to: 'is' })
        
        Page->>CS: window.postMessage({ type: 'set storage', key, value, id, to: 'cs' })
        CS->>Storage: browser.storage.sync.set({ [key]: value })
        Storage-->>CS: result
        CS->>Page: window.postMessage({ type: 'bg result', id, result, to: 'is' })
        
        Page->>CS: window.postMessage({ type: 'propagate config', key, value, id, to: 'cs' })
        CS->>CS: Rewrite to: 'bg'
        CS->>BG: runtime.sendMessage(data)
        BG-->>CS: response
        CS->>Page: window.postMessage(response, window.origin)
    end
    
    loop Background messages to page
        BG->>CS: runtime.onMessage({ type: 'config change', id, value })
        CS->>Page: window.postMessage(e, window.origin)
    end
```

---

## 4. Execution Flow — Injected Script (`index.js`)

### Initialization Sequence

```mermaid
flowchart TD
    A["index.js injected into page<br/>by contentScript.js"] --> B["document.currentScript.remove()<br/>(extension mode only)"]
    B --> C["profile(run)<br/>(wraps in console.profile)"]
    C --> D["run() invoked"]
    
    D --> E["config.load()"]
    E --> E1["Read localStorage.bettercf"]
    E1 --> E2["Merge with defaultConfig"]
    E2 --> E3["If extension:<br/>requestIdleCallback(updateFromSync)"]
    E3 --> E4["Listen for 'request config change' events"]
    
    D --> F["config.createUI()"]
    F --> F1["If extension: no-op<br/>(popup handles settings)"]
    F --> F2["If userscript: create [++] button + modal"]
    
    D --> G["Feature installation loop"]
    G --> G1["For each of 15 modules:<br/>m.install() (try/catch)"]
    G1 --> G2["If configID exists:<br/>registerConfigCallback(id)"]
    G2 --> G3["events.listen(configID, callback)"]
    
    D --> H["Post-install tasks"]
    H --> H1["style.common() — inject common.css (userscript only)"]
    H --> H2["finder.updateGroups() — scrape groups from DOM"]
    
    D --> I["env.run_when_ready(version check)"]
    I --> I1["If version changed:<br/>show update notification message"]
```

### Feature Installation Loop (detailed)

```javascript
// index.js modules array — executed in order
modules = [
    [style,              'style'],            // 1. Custom CSS injection
    [dark_theme,         'darkTheme'],        // 2. Dark mode class
    [show_tags,          'showTags'],         // 3. Show tags button
    [problemset,         'showTags'],         // 4. Problemset tags
    [search_button,      'searchBtn'],        // 5. Google It button
    [show_tutorial,      ''],                 // 6. Tutorial modal (always)
    [navbar,             ''],                 // 7. Dropdown navbar (always)
    [redirector,         ''],                 // 8. Link redirects (always)
    [update_standings,   'standingsItv'],     // 9. Auto-update standings
    [twin_standings,     'standingsTwin'],    // 10. Twin standings
    [verdict_test_number,'hideTestNumber'],   // 11. Hide test number
    [shortcuts,          ''],                 // 12. Keyboard shortcuts (always)
    [sidebar,            'sidebarBox'],       // 13. Sidebar action box
    [mashup,             ''],                 // 14. Mashup tools (always)
    [change_page_title,  ''],                // 15. Dynamic title (always)
]
```

For each module:
1. `m.install()` is called (wrapped in `tryCatch` for error isolation)
2. If a `configID` is provided, `registerConfigCallback(m, configID)` registers an event listener that calls `m.install()` or `m.uninstall()` when the config value changes

---

## 5. Execution Flow — Popup

### `popup.html` + `popup.js`

```mermaid
sequenceDiagram
    participant User
    participant Popup as Popup (popup.js)
    participant Storage as chrome.storage.sync
    participant CS as Content Script (CF tabs)
    participant Feature as Injected Feature Module

    User->>Popup: Click toolbar icon
    Note over Popup: popup.html opens (256px wide)
    Popup->>Popup: Load browser-polyfill.min.js
    Popup->>Popup: Load popup.js
    
    Popup->>Storage: browser.storage.sync.get(['bettercf'])
    Storage-->>Popup: config object
    Popup->>Popup: Merge with defaultConfig
    
    Popup->>Popup: If darkTheme: add 'dark' class to body
    
    Popup->>Popup: Render <Config> component
    Popup->>Popup: Render <Shortcuts> component
    
    User->>Popup: Toggle a setting
    Popup->>Popup: pushChange(id, value)
    Popup->>Popup: events.fire(id, value) — update checkbox
    Popup->>Popup: sendChangeToInjected(id, value)
    
    Popup->>CS: browser.tabs.query({ url: '*://codeforces.com/*' })
    Popup->>CS: for each tab: tabs.sendMessage({ type: 'config change', to: 'is', id, value })
    CS->>Feature: postMessage → config change → install()/uninstall()
    
    Popup->>Storage: browser.storage.sync.set({ bettercf: config })
```

---

## 6. Runtime Execution Timeline

```
=== PAGE LOAD (User navigates to https://codeforces.com/...) ===

[0ms]         document_start
              ├─ Browser injects common.css (from manifest)
              ├─ Browser injects browser-polyfill.min.js
              └─ Browser injects contentScript.js
                   ├─ Registers window 'message' listener
                   ├─ Registers browser.runtime.onMessage listener
                   └─ Creates <script src="chrome-extension://.../index.js">
                   └─ Appends to DOM → index.js starts executing

[0-5ms]       index.js executes (page context)
              ├─ document.currentScript.remove() (extension only)
              ├─ profile(run)
              └─ run() invoked synchronously

[5-10ms]      run()
              ├─ config.load()
              │    ├─ Reads localStorage.bettercf (JSON.parse)
              │    ├─ Merges with defaultConfig
              │    ├─ If extension: requestIdleCallback(updateFromSync)
              │    └─ Listens for 'request config change'
              │
              ├─ config.createUI()
              │    └─ If userscript: creates [++] button and modal
              │
              ├─ modules.forEach(install):
              │    [style → dark_theme → show_tags → problemset →
              │     search_button → show_tutorial → navbar → redirector →
              │     update_standings → twin_standings → verdict_test_number →
              │     shortcuts → sidebar → mashup → change_page_title]
              │
              └─ Post-install:
                   ├─ style.common() → inject common.css (userscript)
                   └─ finder.updateGroups() → scrape groups (if on groups page)

[5-50ms]      Feature installs complete
              └─ Each config-gated module registers config callback

[50ms-2s]     DOMContentLoaded / document.readyState = 'complete'
              ├─ env.ready() callbacks fire
              │   (most features wrap install in env.ready, so actual DOM
              │    manipulation waits until DOM is ready)
              └─ env.run_when_ready(version check)
                   → Shows update notification if version changed

[2s+]         requestIdleCallback fires (extension mode)
              ├─ updateFromSync()
              │    ├─ MPH → Content Script → chrome.storage.sync.get('bettercf')
              │    ├─ Patches local config keys
              │    └─ Fires events for changed keys → triggers install/uninstall
              └─ show_tutorial's idle callback:
                   loadModal() → fetch tutorial, create modal (hidden)

=== ONGOING ===

[Every N seconds, if standingsItv > 0]
  └─ standings/update.js fires
       ├─ Fetches current standings URL
       ├─ Replaces #pageContent with fresh content
       ├─ Fires 'standings updated' event
       └─ Re-runs <script> tags

[User opens popup]
  └─ popup.html loads → popup.js reads sync storage → renders UI
  └─ Changes propagate to all CF tabs via sendChangeToInjected

[Config change from sync or other device]
  └─ updateFromSync() → patches config → fires events → features toggle
```
