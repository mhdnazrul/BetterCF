import env from '../env/env';
import dom from '../helpers/dom';

let originalTitle = '';

export const install = env.ready(function() {
    if (/\/problem\//i.test(location.href)) {
        let problemTitle = dom.$('.title');
        if (problemTitle && problemTitle.textContent) {
            originalTitle = document.title;
            document.title = problemTitle.textContent;
        }
    }
});

export function uninstall() {
    if (originalTitle) {
        document.title = originalTitle;
        originalTitle = '';
    }
}