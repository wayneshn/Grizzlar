"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKEND_ONLY_ERROR = exports.buildAxiosRequest = exports.mergeDeep = exports.isObject = void 0;
const querystring_1 = __importDefault(require("querystring"));
const METHODS_WITH_BODY = ['PUT', 'POST', 'PATCH', 'DELETE'];
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
exports.isObject = isObject;
/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeep(target, ...sources);
}
exports.mergeDeep = mergeDeep;
exports.buildAxiosRequest = ({ templateRequestConfig, method, headers, path, data }) => {
    const axiosConfig = {
        headers,
        method: method,
        url: path
    };
    let dataToSend;
    if (headers && headers['content-type'] === 'application/x-www-form-urlencoded' && typeof data === 'object') {
        dataToSend = querystring_1.default.stringify(data);
    }
    else {
        dataToSend = data;
    }
    if (METHODS_WITH_BODY.includes(method)) {
        axiosConfig.data = dataToSend;
    }
    return mergeDeep(axiosConfig, templateRequestConfig);
};
exports.BACKEND_ONLY_ERROR = {
    code: 'UNAUTHORIZED_FUNCTION_CALL',
    message: 
    // tslint:disable-next-line:max-line-length
    "This function can't be called from the frontend. If you want to call APIs from the frontend, please refer to this link for more information: https://docs.bearer.sh/integration-clients/javascript#calling-apis"
};
