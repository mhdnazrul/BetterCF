import dom from './helpers/dom';
import * as events from './helpers/events';
import { Config, Shortcuts } from './env/config_ui';
import { defaultConfig } from './env/config';
import { sendChangeToInjected } from './helpers/tabMessaging';

let config;

function pushChange(id, value) {
    console.log(`#${id} changed to ${value}. Notifying clients.`);
    config[id] = value;
    events.fire(id, value);
    sendChangeToInjected(id, value);
    browser.storage.sync.set({ bettercf: config });
}
 
function pushShortcut(id, value) {
    console.log(`shortcut #${id} changed to ${value}. Notifying clients.`);
    config.shortcuts[id] = value;
    sendChangeToInjected('shortcuts', config.shortcuts);
    browser.storage.sync.set({ bettercf: config });
}

events.listen('darkTheme', on => {
    document.body.classList.toggle('dark', on);
});

(async function() {
    config = await browser.storage.sync.get(['bettercf']);
    config = config.bettercf;
    config = Object.assign({}, defaultConfig, config);

    if (config.darkTheme)
        document.body.classList.add('dark');

    document.body.appendChild(<div id="ui">
        <Config config={config} pushChange={pushChange} pullChange={events.listen} />
        <span className="hr"/>
        <Shortcuts shortcuts={config.shortcuts} pushChange={pushShortcut}/>
    </div>);
})();