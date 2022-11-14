"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setProxyFunction = exports.setProxyMiddleware = exports.PROXY_PREFIX = void 0;
const lodash_omit_1 = __importDefault(require("lodash.omit"));
const errorHandler_1 = require("../../errorHandler");
const headers_1 = require("../../proxy/headers");
const request_config_1 = require("../../api-config/request-config");
exports.PROXY_PREFIX = '/bearer-proxy';
async function setProxyMiddleware(req, _res, next) {
    const { requestConfig, authType } = await req.integration.config();
    if (!requestConfig) {
        throw new Error('Missing request config');
    }
    const headers = headers_1.stripHopByHopHeaders(req.headers);
    const { auth, method, url } = req;
    const { connectParams } = auth;
    const authForConfig = lodash_omit_1.default(auth, 'connectParams');
    const path = url.replace(exports.PROXY_PREFIX, '');
    req.template = request_config_1.expandRequestConfig({
        authType,
        connectParams,
        headers,
        method,
        path,
        requestConfig,
        auth: authForConfig
    });
    // console.log('req.template', req.template)
    req.userDefinedData = {
        authType,
        headers,
        method,
        path,
        data: req.body
    };
    // console.log('req.userDefinedData', req.userDefinedData)
    next();
}
exports.setProxyMiddleware = setProxyMiddleware;
exports.setProxyFunction = errorHandler_1.asyncMiddleware(setProxyMiddleware);
