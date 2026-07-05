/**
 * @file Shared tab messaging for config propagation
 */
import { MessageType, Target } from './constants';

export function sendChangeToInjected(id, value) {
    function send(tab) {
        browser.tabs.sendMessage(tab.id, {
            type: MessageType.CONFIG_CHANGE,
            to: Target.INJECTED_SCRIPT,
            id,
            value,
        });
    }

    browser.tabs
    .query({ url: '*://codeforces.com/*' })
    .then(tabs => tabs.forEach(send))
    .catch(() => {});
}
