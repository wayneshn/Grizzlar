"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authDetailsResponse = void 0;
const types_1 = require("./v3/types");
const errors_1 = require("./v3/errors");
const strategy_1 = require("./v3/strategy");
const errorHandler_1 = require("../errorHandler");
const common_1 = require("./v3/strategies/oauth2/common");
var TokenType;
(function (TokenType) {
    TokenType["OAuth1"] = "oauth";
    TokenType["OAuth2AccessToken"] = "bearer";
    TokenType["OAuth2RefreshToken"] = "refresh";
    TokenType["OpenIDConnectToken"] = "id"; // Not defined in RFC7662
})(TokenType || (TokenType = {}));
// Follows RFC7662 unless stated otherwise
const formatToken = ({ clientId, expiresIn, scopes, tokenType, updatedAt, value }) => {
    if (!value || value === common_1.NO_VALUE) {
        return;
    }
    const issuedAt = Math.trunc(updatedAt / 1000);
    const expiresAt = expiresIn ? issuedAt + expiresIn : undefined;
    const active = !expiresAt || expiresAt * 1000 > Date.now();
    return {
        active,
        value,
        client_id: clientId,
        exp: expiresAt,
        iat: issuedAt,
        scope: scopes ? scopes.join(' ') : undefined,
        token_type: tokenType
    };
};
const formatAuthDetails = (authType, authDetails) => {
    if (authType === types_1.EAuthType.OAuth1) {
        const { accessToken, callbackParams, consumerKey, consumerSecret, expiresIn, signatureMethod, tokenResponse, tokenSecret, updatedAt } = authDetails;
        return {
            callbackParams,
            consumerKey,
            consumerSecret,
            signatureMethod,
            tokenResponse,
            tokenSecret,
            accessToken: formatToken({
                expiresIn,
                updatedAt,
                clientId: consumerKey,
                tokenType: TokenType.OAuth1,
                value: accessToken
            })
        };
    }
    const { accessToken, callbackParams, clientId, clientSecret, expiresIn, idToken, idTokenJwt, refreshToken, tokenResponse, updatedAt } = authDetails;
    // OAuth2
    return {
        callbackParams,
        clientId,
        clientSecret,
        idTokenJwt,
        tokenResponse,
        accessToken: formatToken({
            clientId,
            updatedAt,
            expiresIn,
            tokenType: TokenType.OAuth2AccessToken,
            value: accessToken
        }),
        idToken: formatToken({ clientId, updatedAt, tokenType: TokenType.OpenIDConnectToken, value: idToken }),
        refreshToken: formatToken({ clientId, updatedAt, tokenType: TokenType.OAuth2RefreshToken, value: refreshToken })
    };
};
exports.authDetailsResponse = errorHandler_1.asyncMiddleware(async (req, res, _next) => {
    const { authType } = await req.integration.config();
    if (!strategy_1.isOAuthType(authType)) {
        throw new errors_1.OAuthOnlyEndpoint(authType);
    }
    res.json(formatAuthDetails(authType, req.auth));
});
