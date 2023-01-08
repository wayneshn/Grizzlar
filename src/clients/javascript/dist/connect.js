export default class PizzlyConnect {
    constructor(integration, options, key, origin) {
        this.status = AuthorizationStatus.IDLE;
        if (!integration) {
            throw new Error("Couldn't connect. Missing argument: integration (string)");
        }
        if (!window) {
            throw new Error("Couldn't connect. The window object is undefined. Are you using connect from a browser?");
        }
        this.integration = integration;
        this.options = options;
        this.key = key;
        this.origin = origin;
    }
    trigger() {
        const query = this.toQueryString(this.key, this.options);
        const url = new URL(`/auth/${this.integration}` + (query ? `?${query}` : ''), this.origin).href;
        return new Promise((resolve, reject) => {
            const handler = (e) => {
                if (this.status !== AuthorizationStatus.BUSY) {
                    return;
                }
                if (e && new URL(e.origin).origin !== new URL(this.origin).origin) {
                    return;
                }
                this.status = AuthorizationStatus.DONE;
                if (!e) {
                    const errorMessage = 'Authorization cancelled. The user has likely interrupted the process by closing the modal.';
                    return reject(new Error(errorMessage));
                }
                if (!e.data || !e.data.eventType) {
                    const errorMessage = 'Authorization failed. The authorization modal sent an unsupported MessageEvent.';
                    return reject(new Error(errorMessage));
                }
                const { data: event } = e;
                if (event.eventType === 'AUTHORIZATION_SUCEEDED') {
                    return resolve(event.data);
                }
                else if (event.eventType === 'AUTHORIZATION_FAILED') {
                    return reject(event.data);
                }
                reject(new Error('Authorization failed. That’s all we know.'));
            };
            window.addEventListener('message', handler, false);
            this.status = AuthorizationStatus.BUSY;
            const modal = new AuthorizationModal(url);
            modal.open();
            modal.addEventListener('close', handler);
        });
    }
    toQueryString(key, options) {
        let query = [];
        if (key && typeof key === 'string') {
            query.push(`pizzly_pkey=${key}`);
        }
        if (options && typeof options.authId === 'string') {
            query.push(`authId=${options.authId}`);
        }
        if (options && typeof options.setupId === 'string') {
            query.push(`setupId=${options.setupId}`);
        }
        if (options && typeof options.params !== 'undefined') {
            for (const param in options.params) {
                const val = options.params[param];
                if (typeof val === 'string') {
                    query.push(`params[${param}]=${val}`);
                }
            }
        }
        return query.join('&');
    }
}
var AuthorizationStatus;
(function (AuthorizationStatus) {
    AuthorizationStatus[AuthorizationStatus["IDLE"] = 0] = "IDLE";
    AuthorizationStatus[AuthorizationStatus["BUSY"] = 1] = "BUSY";
    AuthorizationStatus[AuthorizationStatus["DONE"] = 2] = "DONE";
})(AuthorizationStatus || (AuthorizationStatus = {}));
class AuthorizationModal {
    constructor(url) {
        this.width = 500;
        this.height = 600;
        this.url = url;
        const { left, top, computedWidth, computedHeight } = this.layout(this.width, this.height);
        this.features = {
            width: computedWidth,
            height: computedHeight,
            top,
            left,
            scrollbars: 'yes',
            resizable: 'yes',
            status: 'no',
            toolbar: 'no',
            location: 'no',
            copyhistory: 'no',
            menubar: 'no',
            directories: 'no'
        };
    }
    layout(expectedWidth, expectedHeight) {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const left = screenWidth / 2 - expectedWidth / 2;
        const top = screenHeight / 2 - expectedHeight / 2;
        const computedWidth = Math.min(expectedWidth, screenWidth);
        const computedHeight = Math.min(expectedHeight, screenHeight);
        return { left: Math.max(left, 0), top: Math.max(top, 0), computedWidth, computedHeight };
    }
    open() {
        const url = this.url;
        const windowName = '';
        const windowFeatures = this.featuresToString();
        this.modal = window.open(url, windowName, windowFeatures);
        return this.modal;
    }
    addEventListener(eventType, handler) {
        if (eventType !== 'close') {
            return;
        }
        if (!this.modal) {
            handler();
            return;
        }
        const interval = window.setInterval(() => {
            if (!this.modal || this.modal.closed) {
                handler();
                window.clearInterval(interval);
            }
        }, 100);
    }
    featuresToString() {
        const features = this.features;
        const featuresAsString = [];
        for (let key in features) {
            featuresAsString.push(key + '=' + features[key]);
        }
        return featuresAsString.join(',');
    }
}
//# sourceMappingURL=connect.js.map