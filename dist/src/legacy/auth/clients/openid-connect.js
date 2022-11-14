"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectAccessToken = void 0;
const url_1 = require("url");
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const inspectHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Bearer.sh'
};
const fetchConfiguration = async (issuerIdentifierURL) => {
    try {
        return (await axios_1.default.get(`${issuerIdentifierURL}/.well-known/openid-configuration`)).data;
    }
    catch (e) {
        console.error(e);
    }
};
const inspectToken = async ({ clientId, clientSecret, introspectionEndpoint, token, tokenType }) => {
    const body = querystring_1.default.stringify({ token, token_type_hint: tokenType });
    const options = { auth: { username: clientId, password: clientSecret }, headers: inspectHeaders };
    try {
        return (await axios_1.default.post(introspectionEndpoint, body, options)).data;
    }
    catch (e) {
        console.error(e);
    }
};
exports.inspectAccessToken = async ({ accessToken, clientId, clientSecret, tokenURL }) => {
    const parsedTokenURL = new url_1.URL(tokenURL);
    const config = await fetchConfiguration(parsedTokenURL.origin);
    if (config && config.introspection_endpoint) {
        return inspectToken({
            clientId,
            clientSecret,
            introspectionEndpoint: config.introspection_endpoint,
            token: accessToken,
            tokenType: TokenType.AccessToken
        });
    }
};
var TokenType;
(function (TokenType) {
    TokenType["AccessToken"] = "access_token";
})(TokenType || (TokenType = {}));
