/**
 * @file Shared tab messaging for config propagation
 */
export function sendChangeToInjected(id, value) {
    function send(tab) {
        browser.tabs.sendMessage(tab.id, {
            type: 'config change',
            to: 'is',
            id,
            value,
        });
    }

    browser.tabs
    .query({ url: '*://codeforces.com/*' })
    .then(tabs => tabs.forEach(send));
}
