"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOAuth1Credentials = exports.expandRequestConfig = void 0;
const merge_1 = __importDefault(require("merge"));
const oauth_1 = require("oauth");
const template_1 = require("./template");
const types_1 = require("../auth/v3/types");
const errors_1 = require("./errors");
const labels = {
    baseURL: 'Request Base URL',
    headers: 'Request Header',
    params: 'Request Param'
};
exports.expandRequestConfig = (params) => {
    try {
        return template_1.expandTemplate(params.requestConfig, getVariables(params));
    }
    catch (e) {
        if (!(e instanceof template_1.UndefinedVariable)) {
            throw e;
        }
        const { templatePath, variableName } = e;
        const [attributeName, subAttributeName] = templatePath.split('.');
        const label = labels[attributeName];
        if (e.variableName.startsWith('connectParams.')) {
            throw new errors_1.MissingApiConfigConnectParam(label, subAttributeName, variableName);
        }
        if (e.variableName.startsWith('headers.')) {
            throw new errors_1.MissingApiConfigHeader(label, subAttributeName, variableName);
        }
        throw new errors_1.InvalidApiConfig(label, subAttributeName, variableName);
    }
};
const tryExpandBaseURL = (baseURL, variables) => {
    try {
        return template_1.expandTemplate(baseURL, variables);
    }
    catch (e) {
        return baseURL;
    }
};
const getVariables = ({ auth, authType, connectParams, headers, method, path, requestConfig }) => {
    const partialVariables = { auth, connectParams, headers };
    // We want any expansion errors to be caught later in the process when
    // we have the proper context for error messages
    const baseURL = tryExpandBaseURL(requestConfig.baseURL, partialVariables);
    return merge_1.default.recursive(true, partialVariables, {
        auth: additionalAuthVariables({ auth, authType, baseURL, method, path })
    });
};
const additionalAuthVariables = ({ auth, authType, baseURL, method, path }) => {
    switch (authType) {
        case types_1.EAuthType.OAuth1:
            return { oauth1: exports.getOAuth1Credentials({ baseURL, method, path, auth: auth }) };
        default:
            return {};
    }
};
exports.getOAuth1Credentials = ({ baseURL, method, path, auth }) => {
    const { consumerKey, consumerSecret, accessToken, tokenSecret, signatureMethod } = auth;
    const absUrl = `${baseURL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    const oauth = new oauth_1.OAuth('', // requestUrl
    '', // accessUrl
    consumerKey, consumerSecret, '1.0', // version
    '', // authorize_callback
    signatureMethod);
    return oauth.authHeader(absUrl, accessToken, tokenSecret, method).replace(/^OAuth /, '');
};
