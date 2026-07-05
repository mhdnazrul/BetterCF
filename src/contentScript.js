import { MessageType, Target } from './helpers/constants';

const log = process.env.NODE_ENV === 'development'
            ? console.log
            : function(){};

function success(id, result) {
    window.postMessage({
        type: MessageType.BG_RESULT,
        id: id,
        result: result,
        to: Target.INJECTED_SCRIPT,
    }, window.origin);
}

function failure(id, error) {
    window.postMessage({
        type: MessageType.ERROR,
        id: id,
        error: error,
        to: Target.INJECTED_SCRIPT,
    }, window.origin);
}


// The injected script can't send messages to the background js
// So the content script shall act as a bridge between the two
window.addEventListener('message', e => {
    log('[content] Got', e.data);

    if (e.origin != window.origin || e.data.to != Target.CONTENT_SCRIPT)
        return;

    const id = e.data.id;

    // TODO: error handling for the promises
    if (e.data.type == MessageType.GET_STORAGE) {
        browser.storage.sync
        .get([e.data.key])
        .then(result => success(id, result))
        .catch(err => failure(id, err));
    }
    else if (e.data.type == MessageType.SET_STORAGE) {
        browser.storage.sync
        .set({ [e.data.key]: e.data.value })
        .then(result => success(id, result))
        .catch(err => failure(id, err));
    }
    else {
        // Send to the background to handle
        browser.runtime
        .sendMessage({ ...e.data, to: Target.BACKGROUND })
        .then(response => window.postMessage(response, window.origin))
        .catch(err => log('[content] Error forwarding to background:', err))
    }
});
browser.runtime.onMessage.addListener(e => {
    log('[content] Got from bg', e);
    if (e.to !== Target.INJECTED_SCRIPT) return;
    window.postMessage(e, window.origin);
});

let script = document.createElement('script');
script.src = browser.runtime.getURL('index.js');
script.id = 'bettercf';
(document.body || document.head || document.documentElement).appendChild(script);
script.remove();