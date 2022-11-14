"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyHandler = void 0;
const helpers_1 = require("./helpers");
const axios_1 = __importDefault(require("axios"));
const DEFAULT_CLIENT_TIMEOUT = 30 * 1000;
exports.proxyHandler = async (payload) => {
    const { method, path, headers, data } = payload.userDefinedData;
    const { template } = payload;
    // console.log('here', template)
    // console.log(payload)
    try {
        if (!template) {
            throw new Error('Missing proxy client configuration');
        }
        const templateRequestConfig = template;
        const axiosRequest = helpers_1.buildAxiosRequest({
            templateRequestConfig,
            method,
            headers,
            path,
            data
        });
        let response;
        try {
            response = await axios_1.default({
                timeout: DEFAULT_CLIENT_TIMEOUT,
                ...axiosRequest
            });
        }
        catch (e) {
            // we are a proxy and must not fail it distant API is failing
            if (e.response) {
                response = e.response;
            }
            else {
                throw e;
            }
        }
        // console.log('FUNCTION', response.data)
        return {
            Payload: {
                data: response.data,
                headers: response.headers
            },
            StatusCode: response.status
        };
    }
    catch (e) {
        if (e.code === 'ECONNABORTED') {
            return {
                StatusCode: 504,
                Payload: {
                    headers: {},
                    data: {
                        error: {
                            CODE: 'PROXY_ERROR',
                            message: 'Timed out when connecting to remote host'
                        }
                    }
                }
            };
        }
        return {
            StatusCode: 500,
            Payload: {
                headers: {},
                data: {
                    error: {
                        CODE: 'PROXY_ERROR',
                        message: 'An error occurred during proxy initialization'
                    }
                }
            }
        };
    }
};
