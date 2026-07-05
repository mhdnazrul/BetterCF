// DO NOT DIRECTLY REQUIRE THIS
// require('env.js') instead

import { pluck, nop } from '../helpers/Functional';
import * as events from '../helpers/events';
import { MessageType, Target, EventName } from '../helpers/constants';

export const global = process.env.TARGET == 'extension' && window;

const log = process.env.NODE_ENV == 'development'
            ? console.log
            : nop;

// Stands for Message-Passing Hell and helps us to send and receive messages
let mph = {
    resolvers: {},
    genID: (id => () => id++ | 0)(1),

    send(message) {
        this.init();
        return new Promise((resolve, reject) => {
            let id = this.genID();
            message.id = id;
            message.to = Target.CONTENT_SCRIPT;

            const timeout = setTimeout(() => reject('Failed to get configuration: timeout'), 20000);
            this.resolvers[id] = { resolve, timeout };

            window.postMessage(message, window.origin);
        });
    },

    initialized: false, // not using Functional.once here because it changes `this` to something else
    init() {
        if (this.initialized) return;
        this.initialized = true;

        window.addEventListener('message', e => {
            log("[mph] Got", e.data);
            if (e.origin !== window.origin || e.data.to != Target.INJECTED_SCRIPT)
                return;

            if (e.data.type == MessageType.BG_RESULT) {
                const entry = this.resolvers[e.data.id];
                if (!entry) return;
                clearTimeout(entry.timeout);
                entry.resolve(e.data.result);
                delete this.resolvers[e.data.id];
            }
            else if (e.data.type == MessageType.CONFIG_CHANGE) {
                events.fire(EventName.REQUEST_CONFIG_CHANGE, { id: e.data.id, value: e.data.value });
            }
        });
    }
};

export const storage = {
    get: key => mph.send({ type: MessageType.GET_STORAGE, key })
                .then (pluck(key)),
    set: (key, value) => mph.send({ type: MessageType.SET_STORAGE, key, value }),
    propagate: (key, value) => mph.send({ type: MessageType.PROPAGATE_CONFIG, key, value }),
};