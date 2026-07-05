import * as config from '../env/config';

export function install() {
    if (config.get('darkTheme'))
        document.documentElement.classList.add('bettercf-dark-mode');
}

export function uninstall() {
    document.documentElement.classList.remove('bettercf-dark-mode');
}