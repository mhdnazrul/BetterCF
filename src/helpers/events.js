/**
 * @file Minimalistic event-bus
 */

const listeners = {};

export function listen(event, callback) {
    if (!listeners[event])
        listeners[event] = [];
    if (listeners[event].includes(callback))
        return;
    listeners[event].push(callback);
}

export function removeListener(event, callback) {
    const cbs = listeners[event];
    if (!cbs) return;
    const idx = cbs.indexOf(callback);
    if (idx === -1) return;
    cbs.splice(idx, 1);
}

export function once(event, callback) {
    const wrapper = (...args) => {
        removeListener(event, wrapper);
        return callback(...args);
    };
    listen(event, wrapper);
}

export async function fire(event, data) {
    const cbs = (listeners[event] || []).slice();
    const results = cbs.map(async cb => {
        try { return await cb(data); } catch(e) {}
    });
    return Promise.all(results);
}
