import { sendChangeToInjected } from './helpers/tabMessaging';

browser.runtime.onMessage.addListener(data => {
    console.log('Got message', data);

    if (data.to !== 'bg') return false;

    if (data.type == 'propagate config') {
        sendChangeToInjected(data.key, data.value);
        return Promise.resolve({ id: data.id, to: 'is', type: 'bg result' });
    }

});