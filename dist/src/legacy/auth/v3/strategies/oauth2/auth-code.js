"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const oauth2_1 = require("../../../clients/oauth2");
const errorHandler_1 = require("../../../../errorHandler");
const common_1 = require("./common");
const errors_1 = require("../../errors");
exports.authenticate = errorHandler_1.asyncMiddleware(async (req, res, next) => {
    const callbackURL = process.env.AUTH_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/callback`;
    const { credentials: { clientId, clientSecret }, scopes = [] } = req.setupDetails;
    const { code, error } = req.query;
    const { authorizationURL, authorizationMethod, authorizationParams, bodyFormat, config, tokenParams, tokenURL } = req.integrationConfig;
    if (error) {
        throw errors_1.AuthenticationFailed.fromOAuthRequest(req, undefined);
    }
    if (code) {
        const tokenResult = await oauth2_1.getTokenWithCode({
            authorizationMethod,
            bodyFormat,
            clientId,
            clientSecret,
            code,
            tokenParams,
            tokenURL,
            callbackURL
        });
        // console.log('tokenResult', tokenResult)
        req.credentials = common_1.responseToCredentials(tokenResult);
        // console.log('credentials', req.credentials)
        // console.log('decodedToken', tokenResult.decodedResponse)
        req.tokenResponse = tokenResult.decodedResponse;
        return next();
    }
    // const { scope = [], state = 'none' } = config || {}
    const { state = 'none' } = config || {};
    const redirectURL = oauth2_1.getCodeRedirectURL({
        authorizationParams,
        authorizationURL,
        clientId,
        state,
        scope: scopes || (config === null || config === void 0 ? void 0 : config.scope) || [],
        callbackURL
    });
    res.redirect(redirectURL);
});
