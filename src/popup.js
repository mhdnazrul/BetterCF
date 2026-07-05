import dom from './helpers/dom';
import * as events from './helpers/events';
import { Config, Shortcuts } from './env/config_ui';
import { defaultConfig } from './env/config';
import { sendChangeToInjected } from './helpers/tabMessaging';
import { STORAGE_KEY } from './helpers/constants';

let config;

function pushChange(id, value) {
    console.log(`#${id} changed to ${value}. Notifying clients.`);
    config[id] = value;
    events.fire(id, value);
    sendChangeToInjected(id, value);
    browser.storage.sync.set({ [STORAGE_KEY]: config });
}
 
function pushShortcut(id, value) {
    console.log(`shortcut #${id} changed to ${value}. Notifying clients.`);
    config.shortcuts[id] = value;
    sendChangeToInjected('shortcuts', config.shortcuts);
    browser.storage.sync.set({ [STORAGE_KEY]: config });
}

events.listen('darkTheme', on => {
    document.body.classList.toggle('dark', on);
});

(async function() {
    config = await browser.storage.sync.get([STORAGE_KEY]);
    config = config[STORAGE_KEY];
    config = Object.assign({}, defaultConfig, config);

    if (config.darkTheme)
        document.body.classList.add('dark');

    document.body.appendChild(<div id="ui">
        <Config config={config} pushChange={pushChange} pullChange={events.listen} />
        <span className="hr"/>
        <Shortcuts shortcuts={config.shortcuts} pushChange={pushShortcut}/>
    </div>);
})();