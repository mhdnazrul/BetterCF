# Architecture Diagrams

## 1. System Architecture — Layer Diagram

```mermaid
flowchart TB
    subgraph "Browser Extension (Manifest V2)"
        POPUP["Popup (popup.html/popup.js)
                Settings UI
                Reads/writes chrome.storage.sync
                Sends config changes to all CF tabs"]
        
        subgraph "Background (Event Page)"
            BG["background.js
                 Config propagation relay
                 Receives 'propagate config'
                 Broadcasts to all Codeforces tabs"]
        end
        
        subgraph "Content Script (Isolated World)"
            CS["contentScript.js
                 Message bridge
                 Routes window.postMessage ↔ extension APIs
                 Injects index.js into page context"]
        end
        
        subgraph "Injected Script (Page Context)"
            INDEX["index.js — Orchestrator
                   Config management (localStorage + sync)
                   Feature module installation (15 features)
                   Custom event bus (helpers/events)
                   Custom JSX DOM creation (helpers/dom)"]
                   
            subgraph "Feature Modules"
                STYLE["ext/style.js"]
                DARK["ext/dark_theme.js"]
                TAGS["ext/show_tags.js"]
                PSET["ext/problemset.js"]
                SEARCH["ext/search_button.js"]
                TUTORIAL["ext/show_tutorial.js"]
                NAVBAR["ext/navbar.js"]
                REDIR["ext/redirector.js"]
                STAND["ext/standings/*.js"]
                VERDICT["ext/verdict_test_number.js"]
                SHORTCUT["ext/shortcuts.js"]
                SIDEBAR["ext/sidebar.js"]
                FINDER["ext/finder.js"]
                MASHUP["ext/mashup.js"]
                TITLE["ext/change_page_title.js"]
            end
            
            subgraph "Environment"
                ENV["env/env.js"]
                CONFIG["env/config.js"]
                CONFIG_UI["env/config_ui.js"]
            end
            
            subgraph "Utilities"
                DOM["helpers/dom.js
                     Custom JSX pragma"]
                EVENTS["helpers/events.js
                        Event bus"]
                FUNC["helpers/Functional.js
                      FP utilities"]
                UTIL["helpers/util.js"]
            end
        end
    end
    
    subgraph "Storage"
        LS["localStorage
            bettercf config (primary)
            finderPriority
            userGroups"]
        SS["chrome.storage.sync
            bettercf config (cross-device)"]
    end
    
    subgraph "Codeforces Page"
        CF["Codeforces globals
            Codeforces.*
            MathJax
            submissionsEventCatcher"]
    end
    
    POPUP -->|"browser.tabs.sendMessage"| CS
    POPUP -->|"browser.storage.sync.set"| SS
    CS -->|"browser.runtime.sendMessage"| BG
    BG -->|"browser.tabs.sendMessage"| CS
    CS -->|"window.postMessage"| INDEX
    INDEX -->|"window.postMessage"| CS
    CS -->|"browser.storage.sync.get/set"| SS
    INDEX -->|"localStorage"| LS
    INDEX --> CF
    
    ENV --> EVENTS & DOM & FUNC
    CONFIG --> ENV & CONFIG_UI & EVENTS & DOM & FUNC
    INDEX -.-> ENV & CONFIG & EVENTS & FUNC & DOM
    INDEX --> STYLE & DARK & TAGS & PSET & SEARCH & TUTORIAL
    INDEX --> NAVBAR & REDIR & STAND & VERDICT & SHORTCUT
    INDEX --> SIDEBAR & FINDER & MASHUP & TITLE
```

---

## 2. Module Dependency Diagram

```mermaid
flowchart LR
    subgraph Helpers
        DOM[helpers/dom]
        EV[helpers/events]
        FUNC[helpers/Functional]
        UTIL[helpers/util]
    end
    
    subgraph Environment
        ENV[env/env]
        ENV_SH[env/env-shared]
        ENV_EXT[env/env-extension]
        ENV_US[env/env-userscript]
        CONFIG[env/config]
        CU[env/config_ui]
    end
    
    subgraph Features
        S[ext/style]
        DT[ext/dark_theme]
        ST[ext/show_tags]
        PP[ext/problemset]
        SB[ext/search_button]
        T[ext/show_tutorial]
        N[ext/navbar]
        R[ext/redirector]
        VT[ext/verdict_test_number]
        SK[ext/shortcuts]
        SS[ext/sidebar]
        F[ext/finder]
        M[ext/mashup]
        CT[ext/change_page_title]
    end
    
    subgraph Standings
        SC[ext/standings/common]
        SU[ext/standings/update]
        STW[ext/standings/twin]
    end
    
    subgraph Entry Points
        IX[index.js]
        CS[contentScript.js]
        B[background.js]
        P[popup.js]
    end
    
    %% Dependency edges
    ENV --> ENV_SH & ENV_EXT & ENV_US
    ENV_SH --> DOM & FUNC
    ENV_EXT --> FUNC & EV
    ENV_US --> FUNC
    
    CONFIG --> DOM & FUNC & EV & ENV & CU
    CU --> DOM & FUNC
    
    UTIL --> ENV
    
    S --> DOM & CONFIG
    DT --> CONFIG
    ST --> DOM & CONFIG & ENV
    PP --> DOM & CONFIG & ENV
    SB --> DOM & ENV
    T --> DOM & ENV & FUNC & CONFIG & EV
    N --> DOM & ENV
    R --> DOM & CONFIG & ENV
    VT --> DOM & CONFIG & FUNC & ENV
    SK --> DOM & CONFIG & EV & FUNC & F
    SS --> DOM & CONFIG & ENV & FUNC
    F --> DOM & CONFIG & FUNC & ENV & UTIL
    M --> DOM & CONFIG & ENV
    CT --> ENV & DOM
    
    SC --> DOM
    SU --> DOM & ENV & CONFIG & EV & SC
    STW --> DOM & ENV & CONFIG & EV & FUNC & SC
    
    IX --> S & DT & ST & PP & SB & T & N & R & VT
    IX --> SK & SS & F & M & CT
    IX --> SU & STW
    IX --> ENV & CONFIG & EV & FUNC
    
    P --> DOM & EV & CU
    P -.-> CONFIG
```

---

## 3. Startup Sequence — Timeline

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant Manifest as Manifest
    participant CSS as common.css
    participant Polyfill as browser-polyfill
    participant CS as contentScript.js
    participant IS as index.js (Injected)
    participant DOM as Document DOM
    participant CF as Codeforces Page Globals
    
    Browser->>Manifest: Load extension
    Manifest->>CSS: Inject common.css at document_start
    Manifest->>Polyfill: Load browser-polyfill.min.js
    Manifest->>CS: Load contentScript.js
    
    CS->>CS: Register window 'message' listener
    CS->>CS: Register runtime.onMessage listener
    CS->>DOM: Create script src="chrome-extension://.../index.js"
    CS->>DOM: Append script to DOM
    
    DOM->>IS: Execute index.js in page context
    IS->>IS: document.currentScript.remove()
    IS->>IS: profile(run) → run() invoked
    
    IS->>IS: config.load()
    Note over IS: Read localStorage.bettercf<br/>Merge with defaultConfig<br/>Schedule updateFromSync()
    
    IS->>IS: config.createUI()
    Note over IS: If userscript: create [++] button modal<br/>If extension: no-op
    
    loop For each of 15 modules
        IS->>IS: m.install() (try/catch)
        IS->>IS: registerConfigCallback(configID) if applicable
    end
    
    IS->>IS: style.common() (userscript only)
    IS->>IS: finder.updateGroups()
    
    Note over IS: All modules installed
    
    DOM-->>IS: DOMContentLoaded fires
    
    Note over IS: env.ready() callbacks execute<br/>Actual DOM manipulation happens here
    IS->>CF: version check → show update message
    
    Note over IS: requestIdleCallback fires
    IS->>IS: updateFromSync() → chrome.storage.sync
    IS->>IS: show_tutorial preloads content
```

---

## 4. Message Flow — Complete Diagram

```mermaid
flowchart TB
    subgraph "Message Channels"
        IPC1["browser.tabs.sendMessage"]
        IPC2["browser.runtime.sendMessage"]
        IPC3["window.postMessage"]
        IPC4["browser.storage.sync"]
    end
    
    subgraph "Popup Config Change"
        POPUP["Popup toggles setting"]
        POPUP -->|"browser.tabs.query +<br/>tabs.sendMessage"| CS_TAB["Content Script (Tab)"]
        CS_TAB -->|"window.postMessage"| IS_TAB["Injected Script"]
        IS_TAB -->|"events.fire('request config change')"| CONFIG_MGR["config.js"]
        CONFIG_MGR -->|"events.fire(configKey)"| FEATURE["Feature module<br/>install()/uninstall()"]
        POPUP -->|"browser.storage.sync.set"| STORAGE["chrome.storage.sync"]
    end
    
    subgraph "Storage Read from Injected"
        IS_READ["Injected: storage.get()"]
        IS_READ -->|"postMessage { type:'get storage' }"| CS_STOR["Content Script"]
        CS_STOR -->|"browser.storage.sync.get()"| STORAGE2["chrome.storage.sync"]
        STORAGE2 -->|"result"| CS_STOR
        CS_STOR -->|"postMessage { type:'bg result' }"| IS_READ
    end
    
    subgraph "Config Propagation"
        IS_PROP["Injected: storage.propagate()"]
        IS_PROP -->|"postMessage { type:'propagate config' }"| CS_PROP["Content Script"]
        CS_PROP -->|"runtime.sendMessage { to:'bg' }"| BG["Background Script"]
        BG -->|"Query tabs: codeforces.com/*"| BG
        BG -->|"tabs.sendMessage to each tab"| CS_OTHER["Content Script (other tabs)"]
        CS_OTHER -->|"postMessage { type:'config change' }"| IS_OTHER["Injected (other tabs)"]
        IS_OTHER -->|"feature toggles"| FEATURES_OTHER["Feature modules"]
    end
    
    subgraph "Background to all tabs"
        BG2["Background receives message"]
        BG2 -->|"Broadcast to all CF tabs"| CS_ALL["All Content Scripts"]
        CS_ALL -->|"Forward to page context"| IS_ALL["All Injected Scripts"]
    end
```

---

## 5. Feature Lifecycle — State Machine

```mermaid
stateDiagram-v2
    state "Config-Gated Feature (Boolean)" as BOOL {
        [*] --> Checking: page load
        Checking --> Active: config = true
        Checking --> Inactive: config = false
        Active --> Inactive: config becomes false
        Inactive --> Active: config becomes true
        Active --> [*]: page unload
        Inactive --> [*]: page unload
    }
    
    state "Config-Gated Feature (Number/String)" as NUM {
        [*] --> InstallValue: page load (with value)
        InstallValue --> Active: install(value)
        Active --> Reinstall: config changes
        Reinstall --> Active: uninstall() + install(newValue)
        Active --> [*]: page unload
    }
    
    state "Always-Installed Feature" as ALWAYS {
        [*] --> Install: page load
        Install --> Active: install()
        Active --> [*]: page unload
    }
```

---

## 6. Configuration Storage Architecture

```mermaid
flowchart TB
    subgraph "Extension Mode"
        CONFIG_LOAD["config.load()"]
        CONFIG_LOAD --> LS_READ["Read localStorage.bettercf<br/>(fast, synchronous)"]
        LS_READ --> MERGE["Merge with defaultConfig"]
        MERGE --> IDLE["requestIdleCallback"]
        IDLE --> SYNC_READ["Read chrome.storage.sync.bettercf<br/>(async, via MPH → Content Script)"]
        SYNC_READ --> PATCH["Patch differing keys"]
        PATCH --> FIRE_EVENTS["events.fire(key, value) for each patched key"]
        FIRE_EVENTS --> FEATURE_TOGGLE["Feature install()/uninstall()"]
        
        POPUP_CHANGE["Popup: pushChange()"]
        POPUP_CHANGE --> WRITE_SYNC["browser.storage.sync.set({ bettercf: config })"]
        POPUP_CHANGE --> SEND_TABS["sendChangeToInjected() → all tabs"]
        
        INJECTED_CHANGE["Injected: config.set()"]
        INJECTED_CHANGE --> WRITE_LS["localStorage.bettercf = JSON.stringify(config)"]
        INJECTED_CHANGE --> WRITE_SYNC2["env.storage.set() → MPH → Content Script → chrome.storage.sync"]
        INJECTED_CHANGE --> FIRE_LOCAL["events.fire(key, newValue) → feature toggle"]
    end
    
    subgraph "Userscript Mode"
        US_LOAD["config.load()"]
        US_LOAD --> US_LS["localStorage.bettercf"]
        US_LS --> US_MERGE["Merge with defaultConfig"]
        US_MERGE --> US_SAVE["Save to localStorage"]
        
        US_CHANGE["config.set()"]
        US_CHANGE --> US_WRITE["localStorage.bettercf"]
        US_CHANGE --> US_FIRE["events.fire() → feature toggle"]
    end
    
    subgraph "Config Keys"
        KEYS["Config Object"]
        KEYS --> BOOL1["showTags: true"]
        KEYS --> BOOL2["style: true"]
        KEYS --> BOOL3["darkTheme: false"]
        KEYS --> BOOL4["standingsTwin: false"]
        KEYS --> BOOL5["hideTestNumber: false"]
        KEYS --> BOOL6["sidebarBox: true"]
        KEYS --> BOOL7["tutorialSpoilers: false"]
        KEYS --> BOOL8["mashupSpoilers: false"]
        KEYS --> NUM1["standingsItv: 0"]
        KEYS --> STR1["defStandings: 'Common'"]
        KEYS --> OBJ1["shortcuts: { ... }"]
        KEYS --> STR2["version: (from package.json)"]
    end
```

---

## 7. Features by Page Type

```mermaid
flowchart TB
    subgraph "Codeforces Pages"
        ANY["ANY Page<br/>(codeforces.com/*)"]
        PROBLEM["Problem Page<br/>/problem/, /contest/*/problem/*"]
        PROBLEMSET["Problemset Page<br/>/problemset"]
        GYM["Gym/Group Page<br/>/gym/*, /group/*"]
        STANDINGS["Standings Page<br/>/standings"]
        MASHUP["Mashup Page<br/>/mashups"]
        CONTEST["Contest Page<br/>/contest/*"]
    end
    
    subgraph "Features by Page"
        ANY --> |"Always"| DARK["Dark Theme"]
        ANY --> |"Always"| NAV["Custom Navbar"]
        ANY --> |"Always"| REDIR["Link Redirects"]
        ANY --> |"Always"| SHORTCUTS["Keyboard Shortcuts"]
        ANY --> |"Always"| FINDER["Finder (Ctrl+Space)"]
        ANY --> |"Always"| STYLE["Custom CSS"]
        ANY --> |"Always"| SIDEBAR["Sidebar Box"]
        ANY --> |"Toggle"| VERDICT["Hide Test Number"]
        
        PROBLEM --> |"Always"| TITLE["Change Page Title"]
        PROBLEM --> |"Toggle"| SHOW_TAGS["Show Tags Button"]
        PROBLEM --> |"Always"| TUTORIAL["Tutorial Button"]
        
        PROBLEMSET --> |"Toggle"| PSET_TAGS["Hide Tags (unsolved)"]
        
        GYM --> |"Toggle"| SEARCH_IT["Google It Button"]
        GYM --> |"Always"| VIRTUAL["Start Virtual Button"]
        
        STANDINGS --> |"Interval"| UPDATE["Auto-Update Standings"]
        STANDINGS --> |"Toggle"| TWIN["Twin Standings"]
        
        MASHUP --> |"Always"| MASHUP_FEATURES["Add All Button<br/>Tag Spoilers"]
        
        CONTEST --> |"Always"| CONTEST_STANDINGS["Standings Links"]
    end
```
