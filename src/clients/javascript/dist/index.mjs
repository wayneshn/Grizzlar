class PizzlyConnect {
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

class PizzlyIntegration {
    constructor(integration, options, key, origin) {
        this.options = {};
        this.auth = (authId) => new PizzlyIntegration(this.integration, Object.assign(Object.assign({}, this.options), { authId }), this.key, this.origin);
        this.setup = (setupId) => new PizzlyIntegration(this.integration, Object.assign(Object.assign({}, this.options), { setupId }), this.key, this.origin);
        this.get = (endpoint, parameters) => {
            return this.request('GET', endpoint, parameters);
        };
        this.head = (endpoint, parameters) => {
            return this.request('HEAD', endpoint, parameters);
        };
        this.post = (endpoint, parameters) => {
            return this.request('POST', endpoint, parameters);
        };
        this.put = (endpoint, parameters) => {
            return this.request('PUT', endpoint, parameters);
        };
        this.delete = (endpoint, parameters) => {
            return this.request('DELETE', endpoint, parameters);
        };
        this.patch = (endpoint, parameters) => {
            return this.request('PATCH', endpoint, parameters);
        };
        this.request = (method, endpoint, parameters = {}) => {
            if (parameters && typeof parameters !== 'object') {
                throw new Error('Unable to trigger API request. Request parameters should be an object in the form "{ headers: { "Foo": "bar" }, body: "My body" }');
            }
            const headers = {
                'Pizzly-Auth-Id': this.options.authId,
                'Pizzly-Setup-Id': this.options.setupId
            };
            if (parameters && parameters.headers) {
                for (const key in parameters.headers) {
                    headers[`Pizzly-Proxy-${key}`] = parameters.headers[key];
                }
            }
            const url = this.toURL(this.origin, `/proxy/${this.integration}`, endpoint, this.key, parameters.query);
            const fetch = window.fetch;
            return fetch(url.toString(), {
                method,
                headers: this.cleanHeaders(headers),
                body: parameters && parameters.body
            });
        };
        this.integration = integration;
        this.options = options;
        this.origin = origin;
        this.key = key;
    }
    connect(options) {
        const connectOptions = Object.assign(Object.assign({}, this.options), (options || {}));
        const connect = new PizzlyConnect(this.integration, connectOptions, this.key, this.origin);
        return connect.trigger();
    }
    toURL(origin, baseURL, endpoint, key, queryString) {
        const removeLeadingSlash = (text) => {
            return text.replace(/^\//, '');
        };
        const removeTrailingSlash = (text) => {
            return text.replace(/\/$/, '');
        };
        const urlParts = [];
        urlParts.push(removeTrailingSlash(origin));
        urlParts.push(removeLeadingSlash(removeTrailingSlash(baseURL)));
        urlParts.push(removeLeadingSlash(endpoint));
        const url = new URL(urlParts.join('/'));
        if (key) {
            url.searchParams.append('pizzly_pkey', key);
        }
        if (queryString) {
            Object.keys(queryString).forEach(key => url.searchParams.append(key, String(queryString[key])));
        }
        return url;
    }
    cleanHeaders(obj) {
        return Object.keys(obj).reduce((acc, key) => {
            if (obj[key] !== undefined) {
                acc[key] = obj[key];
            }
            return acc;
        }, {});
    }
}

class Pizzly {
    constructor(options, legacyOptions) {
        this.key = '';
        this.origin = '';
        if (!window) {
            const errorMessage = "Couldn't initialize Pizzly. The window object is undefined. Are you using Pizzly from a browser?";
            throw new Error(errorMessage);
        }
        if (options && typeof options === 'string') {
            this.key = options;
        }
        if (legacyOptions && typeof legacyOptions === 'string') {
            this.origin = new URL(legacyOptions).href;
        }
        else if (legacyOptions && typeof legacyOptions === 'object') {
            const legacyProtocol = legacyOptions.protocol || window.location.protocol;
            const legacyPort = legacyOptions.port || window.location.port || 80;
            const legacyHostname = legacyOptions.hostname || window.location.hostname;
            this.origin = new URL(legacyProtocol + '//' + legacyHostname + ':' + legacyPort).href;
        }
        if (!this.origin) {
            const host = typeof options === 'object' && options.host;
            if (!host) {
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                const port = window.location.port || 80;
                const host = hostname + (Number(port) !== 80 ? `:${port}` : '');
                this.origin = new URL(protocol + '//' + host).href;
            }
            else {
                if (host.startsWith('http://') || host.startsWith('https://')) {
                    this.origin = new URL(host).href;
                }
                else {
                    const protocol = window.location.protocol;
                    this.origin = new URL(protocol + '//' + host).href;
                }
            }
        }
        if (!this.key) {
            const publishableKey = typeof options === 'object' && options.publishableKey;
            if (publishableKey) {
                this.key = publishableKey;
            }
        }
        return this;
    }
    connect(integration, options) {
        const connect = new PizzlyConnect(integration, options || {}, this.key, this.origin);
        return connect.trigger();
    }
    integration(integration, options) {
        return new PizzlyIntegration(integration, options || {}, this.key, this.origin);
    }
}

export default Pizzly;
