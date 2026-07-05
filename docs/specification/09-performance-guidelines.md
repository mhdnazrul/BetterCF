# Performance Guidelines

## Performance Budget

BetterCF must not degrade the Codeforces browsing experience. The following budgets are hard limits:

| Metric | Limit | Measurement |
|--------|-------|-------------|
| Bundle size (extension, gzipped) | < 100 KB | `npx rollup -c` output |
| Bundle size (userscript, gzipped) | < 80 KB | `npx rollup -c` output |
| Synchronous init time | < 50 ms | `performance.now()` in `index.js:run()` |
| DOM mutations per feature install | < 20 | Manual count in code review |
| Memory leak per page visit | < 100 KB | Chrome DevTools Heap Snapshot |
| Layout shifts | 0 | Lighthouse / Performance tab |
| Runtime CSS injection | < 10 ms | `performance.now()` around `addStyle` |

## DOM Access

### Minimize Queries

- Cache DOM queries in local variables. Do not re-query the same element.
- Use `dom.$()` for single elements, `dom.$$()` for collections.
- Prefer `closest()` over walking `parentNode` chains.

```javascript
// Good
const container = dom.$('#pageContent');
if (!container) return;
doSomething(container);
doSomethingElse(container);

// Bad
doSomething(dom.$('#pageContent'));
doSomethingElse(dom.$('#pageContent'));
```

### Batch Reads and Writes

Layout thrashing happens when reads and writes interleave. Batch them:

```javascript
// Good: read all, then write all
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => { el.style.height = `${heights[i]}px`; });

// Bad: interleaved
elements.forEach(el => {
    const h = el.offsetHeight;  // read
    el.style.height = `${h}px`; // write (forces layout)
});
```

## Caching

### `once()` Utility

Use `helpers/Functional.js`'s `once()` for expensive operations that should run exactly once:

- Tutorial modal creation
- Finder modal creation
- Twin standings URL computation
- Theme detection

### Memoization

Use `once()` for memoization of pure computations. Do not use `Map`/`WeakMap` caches unless the cached value needs invalidation.

### DOM Node References

Keep references to created DOM nodes for fast removal in `uninstall()`. Do not re-query:

```javascript
// Good
let styleElement;
export async function custom() {
    styleElement = await addStyle(customCSS);
}
export function uninstall() {
    if (styleElement) styleElement.remove();
}

// Bad — re-queries the DOM on uninstall
export function uninstall() {
    dom.$('.bettercf-style').remove();
}
```

## MutationObserver

- Use `MutationObserver` only when there is no DOM event alternative.
- Disconnect observers in `uninstall()` to prevent memory leaks.
- Keep observer callbacks lightweight. If heavy work is needed, debounce it.

```javascript
const observer = new MutationObserver(() => {
    // light work
});
observer.observe(target, { childList: true });

// In uninstall:
observer.disconnect();
```

## Debouncing

- Use `helpers/Functional.js` `debounce()` for input-triggered operations (e.g., search filtering).
- Use `requestAnimationFrame()` for visual updates on scroll or resize.
- Use `requestIdleCallback()` for non-critical background work.

### Debounce Timing

| Use Case | Delay |
|----------|-------|
| Input filtering (finder) | Immediate (no debounce — it's typeahead) |
| Config push to sync | 250ms |
| Standings update polling | Configurable via `standingsItv` (seconds) |
| Window resize handling | 150ms |

## Memory Leaks

### Common Sources

1. **Unremoved event listeners** — Always remove listeners added to `window` or `document` in `uninstall()`.
2. **Detached DOM nodes** — When replacing content, old nodes are garbage-collected. Verify with Heap Snapshots.
3. **setInterval not cleared** — Store the interval ID and clear it in `uninstall()`.
4. **Observer not disconnected** — Disconnect `MutationObserver` in `uninstall()`.
5. **Closures holding references** — Be mindful of closures in event callbacks that reference large objects.

### Mitigation

```javascript
let intervalID;
let observer;
let listener;

export function install() {
    intervalID = setInterval(update, 5000);
    observer = new MutationObserver(callback);
    observer.observe(target, config);
    listener = () => { /* ... */ };
    window.addEventListener('scroll', listener);
}

export function uninstall() {
    clearInterval(intervalID);
    observer?.disconnect();
    window.removeEventListener('scroll', listener);
}
```

## Extension-Specific Concerns

### Message Passing Overhead

- Each `window.postMessage` round-trip (IS → CS → Storage → CS → IS) adds ~1–5ms.
- Batch storage writes where possible (`browser.storage.sync.set({ ...allKeys })`).
- Config propagation to all tabs is O(n) in number of open tabs. This is acceptable for rare config changes.

### Content Script Bloat

- The content script (`contentScript.js`) is intentionally minimal — it is only a message bridge.
- Do not add feature logic to the content script. Everything goes in the injected script.
- The browser polyfill (`browser-polyfill.min.js`) is the only non-minimal dependency. Its size (~10 KB) is acceptable.

## Profiling

### Development Mode

When `NODE_ENV=development`, `console.time` and `console.profile` are active for key operations:

- Module installation times
- Config loading
- Tutorial loading

### Production Profiling

In production, all profiling is disabled by default. To diagnose performance issues:

1. Open Chrome DevTools → Performance tab.
2. Record a page load from `codeforces.com`.
3. Look for long tasks (>50ms) that correlate with BetterCF initialization.

## Lazy Loading Strategy

| Feature | Load Strategy | Ready Mechanism |
|---------|---------------|-----------------|
| Custom CSS | On `env.ready` | Injected immediately |
| Dark mode | On `env.ready` | Class added synchronously |
| Show tags | On `env.ready` | Waits for DOM |
| Tutorial modal data | `requestIdleCallback` | Prefetches; shows on click |
| Finder modal | `once()` + `requestIdleCallback` | Created lazily on first open |
| Standings auto-update | `setInterval` | Starts on `env.ready` |
| Twin standings | `env.ready` + API check | Waits for API response |
