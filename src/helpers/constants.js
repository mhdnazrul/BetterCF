export const STORAGE_KEY = 'bettercf';

export const MessageType = {
    GET_STORAGE: 'get storage',
    SET_STORAGE: 'set storage',
    PROPAGATE_CONFIG: 'propagate config',
    CONFIG_CHANGE: 'config change',
    BG_RESULT: 'bg result',
    ERROR: 'error',
};

export const Target = {
    INJECTED_SCRIPT: 'is',
    CONTENT_SCRIPT: 'cs',
    BACKGROUND: 'bg',
};

export const EventName = {
    REQUEST_CONFIG_CHANGE: 'request config change',
    STANDINGS_UPDATED: 'standings updated',
};
