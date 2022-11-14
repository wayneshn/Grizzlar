"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripHopByHopHeaders = void 0;
const hopByHopHeaders = [
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
    'host',
    'authorization',
    'x-forwarded-for' // to avoid sending the origin IP to the provider (because the rate limiting)
];
const connection = 'connection';
const BEARER_PREFIX = 'bearer-';
const AMAZON_PREFIX = 'x-amzn';
exports.stripHopByHopHeaders = function (requestHeaders) {
    const requestHeadersCopy = Object.assign({}, requestHeaders);
    hopByHopHeaders.forEach((hopByHopHeaderName) => {
        delete requestHeadersCopy[hopByHopHeaderName];
    });
    stripConnectionHeaders(requestHeadersCopy);
    stripHttp2AndBearerHeaders(requestHeadersCopy);
    return requestHeadersCopy;
};
const stripHttp2AndBearerHeaders = function (requestHeaders) {
    Object.keys(requestHeaders).forEach((headerName) => {
        if (headerName.includes(':') || headerName.startsWith(BEARER_PREFIX) || headerName.startsWith(AMAZON_PREFIX)) {
            delete requestHeaders[headerName.trim()];
        }
    });
};
const stripConnectionHeaders = function (requestHeaders) {
    let connectionHeaders = requestHeaders[connection];
    if (connectionHeaders) {
        connectionHeaders = lowercaseHeaders(connectionHeaders.split(','));
        delete requestHeaders[connection];
        connectionHeaders.forEach((connectionHeader) => {
            delete requestHeaders[connectionHeader.trim()];
        });
    }
    return requestHeaders;
};
const lowercaseHeaders = function (headers) {
    return headers.map((header) => {
        return header.toLowerCase();
    });
};
