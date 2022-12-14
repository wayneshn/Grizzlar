"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyResponse = exports.okStatusCode = exports.intentStatusCode = void 0;
function intentStatusCode(req, res) {
    const { StatusCode, Payload } = req.bearerResponse;
    // here we return payload as is because it is json string, no need to parse and use json()
    const { statusCode, ...lambdaPayload } = JSON.parse(Payload);
    res.status(statusCode || StatusCode).send(lambdaPayload);
}
exports.intentStatusCode = intentStatusCode;
function okStatusCode(req, res) {
    const { Payload } = req.bearerResponse;
    // here we return payload as is because it is json, no need to parse and use json()
    res.status(200).send(Payload);
}
exports.okStatusCode = okStatusCode;
function proxyResponse(req, res) {
    const { Payload } = req.bearerResponse;
    const parsedPayload = JSON.parse(Payload);
    if (parsedPayload.error) {
        const { statusCode, error } = parsedPayload;
        return res.status(statusCode || 422).send({ error });
    }
    const { data: { headers, data, status } } = JSON.parse(Payload);
    for (const headerName in headers) {
        if (headers.hasOwnProperty(headerName) && !PROXY_HEADER_BLACKLIST.has(headerName.toLowerCase())) {
            const value = headers[headerName];
            if (!FAILING_HEADER_VALUE.has(value)) {
                res.setHeader(headerName, headers[headerName]);
            }
        }
    }
    res.status(status).send(data);
}
exports.proxyResponse = proxyResponse;
const FAILING_HEADER_VALUE = new Set([undefined, null, '']);
const PROXY_HEADER_BLACKLIST = new Set(['connection', 'upgrade']);
