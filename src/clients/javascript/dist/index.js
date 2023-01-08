import PizzlyConnect from './connect';
import PizzlyIntegration from './integration';
export default class Pizzly {
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
//# sourceMappingURL=index.js.map