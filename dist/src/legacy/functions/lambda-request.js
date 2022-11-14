"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = exports.BUID = void 0;
const errorHandler_1 = require("../errorHandler");
const function_1 = require("../proxy/function");
const errors_1 = require("../errors");
exports.BUID = 'bearerUid';
const FAILING_HEADER_VALUE = new Set([undefined, null, '']);
const PROXY_HEADER_BLACKLIST = new Set(['connection', 'upgrade']);
const defaultFilterKeys = ['authorization', 'apikey', 'api_key', 'code', 'password', 'secret', 'token'];
exports.middleware = () => errorHandler_1.asyncMiddleware(async (req, res, next) => {
    const { auth, authId } = req;
    // use the clientId retrieved from the checkAuthorization middleware
    // const clientId: string = req.clientId || req.query.clientId || ''
    // allow option to overwrite setupId in query
    const setupId = req.query.setupId || req.setupId;
    // console.log('in lambda request middleware')
    try {
        const payload = {
            body: req.body,
            queryStringParameters: { ...req.params, ...req.query, authId, setupId },
            template: req.template,
            userDefinedData: req.userDefinedData,
            context: {
                auth,
                isBackend: Boolean(req.isBackend),
                metadata: {
                    filterKeys: defaultFilterKeys
                }
            }
        };
        // console.log(payload)
        const response = await function_1.proxyHandler(payload);
        const { StatusCode, Payload } = response;
        // console.log(response)
        // console.log(StatusCode)
        // console.log(Payload)
        // if (Payload.data.error) {
        //   const { StatusCode, data: error } = Payload
        //   return res.status(statusCode || 422).send({ error })
        // }
        const { data, headers } = Payload;
        // console.log(data)
        // console.log(Payload)
        for (const headerName in headers) {
            if (headers.hasOwnProperty(headerName) && !PROXY_HEADER_BLACKLIST.has(headerName.toLowerCase())) {
                const value = headers[headerName];
                if (!FAILING_HEADER_VALUE.has(value)) {
                    res.setHeader(headerName, headers[headerName]);
                }
            }
        }
        res.status(StatusCode).send(data);
        // next()
    }
    catch (e) {
        // re-throw the correct error
        if (e instanceof errors_1.UserError) {
            throw e;
        }
        throw new errors_1.GenericFunctionError(req, e);
    }
});
