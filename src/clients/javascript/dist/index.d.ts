import PizzlyIntegration from './integration';
import Types from './types';
export default class Pizzly {
    readonly key: string;
    readonly origin: string;
    constructor(options?: {
        host?: string;
        publishableKey?: string;
    } | string, legacyOptions?: {
        protocol?: string;
        hostname?: string;
        port?: number | string;
    } | string);
    connect(integration: string, options?: Types.ConnectOptions): Promise<Types.ConnectSuccess>;
    integration(integration: string, options?: Types.IntegrationOptions): PizzlyIntegration;
}
