"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyFormat = exports.AuthorizationMethod = exports.getTokenWithClientCredentials = exports.getTokenWithRefreshToken = exports.getTokenWithCode = exports.getCodeRedirectURL = void 0;
const simple_oauth2_1 = __importDefault(require("simple-oauth2"));
const url_1 = require("url");
const errors_1 = require("../v3/errors");
// import { inspectAccessToken } from './openid-connect'
const headers = { 'User-Agent': 'Pizzly' };
const createClientForRedirect = ({ authorizationURL, clientId }) => {
    const url = new url_1.URL(authorizationURL);
    return simple_oauth2_1.default.create({
        client: { id: clientId, secret: '' },
        auth: {
            tokenHost: url.origin,
            authorizeHost: url.origin,
            authorizePath: url.pathname
        },
        http: { headers }
    });
};
const createClientForToken = ({ authorizationMethod, bodyFormat, clientId, clientSecret, tokenURL }) => {
    const url = new url_1.URL(tokenURL);
    return simple_oauth2_1.default.create({
        client: { id: clientId, secret: clientSecret },
        auth: { tokenHost: url.origin, tokenPath: url.pathname },
        http: { headers, events: true },
        options: {
            authorizationMethod: authorizationMethod || AuthorizationMethod.Body,
            bodyFormat: bodyFormat || BodyFormat.Form
        }
    });
};
const translateError = (e) => {
    if (e.data && e.data.isResponseError) {
        const { payload, res: { statusCode } } = e.data;
        const response = Buffer.isBuffer(payload) ? payload.toString() : payload;
        return new errors_1.AuthenticationFailed({ statusCode, response });
    }
    if (e.isBoom) {
        return new errors_1.AuthenticationFailed({ message: e.message });
    }
    return e;
};
const translateNoTokenResponse = (response) => {
    // The simple-oauth2 library blindly does an Object.assign with the response.
    // When the response was a string, it results in an object with string index
    // keys and numeric character code values!
    const hasIntegerKeys = Object.keys(response)
        .map(Number)
        .every(Number.isInteger);
    const values = Object.values(response);
    if (hasIntegerKeys && values.every(Number.isInteger)) {
        return String.fromCharCode(...values);
    }
    return response;
};
const getExpiresIn = async (params, token) => {
    // const { clientId, clientSecret, tokenURL } = params
    // Zoho doesn't follow the spec and returns `expires_in` in ms.
    // They provide the usual value in `expires_in_sec` instead
    const expiresIn = token.expires_in_sec || token.expires_in;
    // if (!expiresIn) {
    //   const metadata = await inspectAccessToken({ clientId, clientSecret, tokenURL, accessToken: token.access_token })
    //   if (metadata && metadata.exp) {
    //     const issuedAt = metadata.iat || Math.trunc(Date.now() / 1000)
    //     return metadata.exp - issuedAt
    //   }
    // }
    return expiresIn;
};
const wrapTokenOperation = async (client, params, body) => {
    // The simple-oauth2 library has no supported way of accessing the
    // request/response so we must reach into it's guts and hook the HTTP client
    // that it uses!
    const wreck = client.authorizationCode.client.client;
    let headers;
    wreck.events.once('response', (_err, { res }) => {
        if (res) {
            headers = res.headers;
        }
    });
    let token;
    try {
        token = await body();
    }
    catch (e) {
        throw translateError(e);
    }
    if (!token.access_token) {
        throw new errors_1.AuthenticationFailed({
            message: 'No access token returned',
            response: translateNoTokenResponse(token)
        });
    }
    return {
        accessToken: token.access_token,
        expiresIn: await getExpiresIn(params, token),
        idToken: token.id_token,
        refreshToken: token.refresh_token,
        decodedResponse: {
            headers,
            body: token
        }
    };
};
const buildScope = (scopes) => scopes.join(' ');
exports.getCodeRedirectURL = (params) => {
    const { authorizationParams, callbackURL, scope, state } = params;
    const client = createClientForRedirect(params);
    return client.authorizationCode.authorizeURL({
        ...authorizationParams,
        state,
        redirect_uri: callbackURL,
        scope: buildScope(scope)
    });
};
exports.getTokenWithCode = async (params) => {
    const { callbackURL, code, tokenParams } = params;
    const client = createClientForToken(params);
    return wrapTokenOperation(client, params, () => client.authorizationCode.getToken({
        ...tokenParams,
        code,
        redirect_uri: callbackURL
    }));
};
exports.getTokenWithRefreshToken = async (params) => {
    const { idToken, refreshToken } = params;
    const client = createClientForToken(params);
    const clientToken = client.accessToken.create({ refresh_token: refreshToken });
    const response = await wrapTokenOperation(client, params, async () => {
        return (await clientToken.refresh()).token;
    });
    response.refreshToken = response.refreshToken || refreshToken;
    response.idToken = response.idToken || idToken;
    return response;
};
exports.getTokenWithClientCredentials = async (params) => {
    const { scope } = params;
    const client = createClientForToken(params);
    return wrapTokenOperation(client, params, async () => {
        return client.clientCredentials.getToken({ scope: buildScope(scope) });
    });
};
var AuthorizationMethod;
(function (AuthorizationMethod) {
    AuthorizationMethod["Body"] = "body";
    AuthorizationMethod["Header"] = "header";
})(AuthorizationMethod = exports.AuthorizationMethod || (exports.AuthorizationMethod = {}));
var BodyFormat;
(function (BodyFormat) {
    BodyFormat["Form"] = "form";
    BodyFormat["JSON"] = "json";
})(BodyFormat = exports.BodyFormat || (exports.BodyFormat = {}));
