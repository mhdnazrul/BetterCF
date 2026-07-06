/**
 * @file Background service worker for MV3
 * Handles message passing between content scripts and the extension
 */

import browser from 'webextension-polyfill';

import { sendChangeToInjected } from './helpers/tabMessaging';
import { MessageType, Target } from './helpers/constants';

browser.runtime.onMessage.addListener(data => {
    console.log('Got message', data);

    if (data.to !== Target.BACKGROUND) return false;

    if (data.type == MessageType.PROPAGATE_CONFIG) {
        sendChangeToInjected(data.key, data.value);
        return Promise.resolve({ id: data.id, to: Target.INJECTED_SCRIPT, type: MessageType.BG_RESULT });
    }

});