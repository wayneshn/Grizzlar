import Types from './types';
export default class PizzlyIntegration {
    private key;
    private integration;
    private options;
    private origin;
    constructor(integration: string, options: Types.IntegrationOptions, key: string, origin: string);
    auth: (authId: string) => PizzlyIntegration;
    setup: (setupId: string) => PizzlyIntegration;
    connect(options?: Types.ConnectOptions): Promise<Types.ConnectSuccess>;
    get: (endpoint: string, parameters?: Types.RequestParameters | undefined) => Promise<Response>;
    head: (endpoint: string, parameters?: Types.RequestParameters | undefined) => Promise<Response>;
    post: (endpoint: string, parameters?: Types.RequestParameters | undefined) => Promise<Response>;
    put: (endpoint: string, parameters?: Types.RequestParameters | undefined) => Promise<Response>;
    delete: (endpoint: string, parameters?: Types.RequestParameters | undefined) => Promise<Response>;
    patch: (endpoint: string, parameters?: Types.RequestParameters | undefined) => Promise<Response>;
    request: (method: Types.RequestMethod, endpoint: string, parameters?: Types.RequestParameters) => Promise<Response>;
    private toURL;
    private cleanHeaders;
}
