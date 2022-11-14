"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = void 0;
const oauth2_1 = require("../../../legacy/auth/clients/oauth2");
const oauth2_2 = require("../../../legacy/auth/v3/strategies/oauth2");
const errors_1 = require("../../../legacy/auth/v3/errors");
/**
 * Refresh an authentication using OAuth2 strategy
 *
 * @param integration - The integration metadata
 * @param configuration - The configuration
 * @param oldAuthentication - The previous authentication
 */
exports.refresh = async (integration, configuration, oldAuthentication) => {
    const oldPayload = oldAuthentication.payload;
    const refreshToken = oldPayload.refreshToken;
    const { clientId, clientSecret } = configuration.credentials;
    if (!refreshToken) {
        const { tokenParams, tokenURL, authorizationMethod, bodyFormat } = integration.auth;
        const { grant_type: grantType } = tokenParams;
        if (grantType !== oauth2_2.GrantType.ClientCredentials) {
            throw new errors_1.AccessTokenExpired();
        }
        const tokenResult = await oauth2_1.getTokenWithClientCredentials({
            authorizationMethod,
            bodyFormat,
            clientId,
            clientSecret,
            tokenURL,
            scope: configuration.scopes
        });
        const oauthPayload = {
            serviceName: oldPayload.serviceName,
            userId: oldAuthentication.auth_id,
            setupId: oldAuthentication.setup_id,
            updatedAt: Date.now(),
            ...tokenResult
        };
        return oauthPayload;
    }
    const { idToken, refreshURL, tokenURL } = integration.auth;
    const tokenResult = await oauth2_1.getTokenWithRefreshToken({
        ...{ clientId, clientSecret },
        // ...setupDetails,
        refreshToken,
        idToken,
        tokenURL: refreshURL || tokenURL
    });
    const oauthPayload = {
        serviceName: oldPayload.serviceName,
        userId: oldAuthentication.auth_id,
        setupId: oldAuthentication.setup_id,
        updatedAt: Date.now(),
        ...tokenResult
    };
    return oauthPayload;
};
