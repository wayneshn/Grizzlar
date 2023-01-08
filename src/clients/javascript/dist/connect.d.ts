import Types from './types';
export default class PizzlyConnect {
    private key;
    private integration;
    private options?;
    private status;
    private origin;
    constructor(integration: string, options: Types.ConnectOptions, key: string, origin: string);
    trigger(): Promise<Types.ConnectSuccess>;
    toQueryString(key?: string, options?: Types.ConnectOptions): string;
}
