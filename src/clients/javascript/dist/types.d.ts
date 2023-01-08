declare namespace Types {
    interface ConnectOptions {
        authId?: string;
        setupId?: string;
        params?: any;
    }
    interface ConnectSuccess {
        authId: string;
    }
    interface ConnectError extends Error {
    }
    interface IntegrationOptions {
        authId?: string;
        setupId?: string;
    }
    type RequestHeaders = Record<string, string | number | undefined>;
    type RequestMethod = 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH';
    type RequestQueryString = Record<string, string | number>;
    interface RequestParameters {
        headers?: RequestHeaders;
        query?: RequestQueryString;
        body?: any;
    }
}
export default Types;
