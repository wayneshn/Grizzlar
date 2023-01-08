import PizzlyConnect from './connect';
export default class PizzlyIntegration {
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
//# sourceMappingURL=integration.js.map