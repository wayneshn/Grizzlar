"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAuthentication = exports.accessTokenHasExpired = void 0;
const OAuth2 = __importStar(require("./oauth2"));
const database_1 = require("../database");
const integrations_1 = require("../database/integrations");
const error_handling_1 = require("../error-handling");
const common_1 = require("../../legacy/auth/v3/strategies/oauth2/common");
/**
 * Determine if an access token has expired by comparing
 * the expiresIn value with the current time.
 *
 * @param authentication (Types.Authentication) - The authentication object
 * @return (boolean)
 */
exports.accessTokenHasExpired = async (authentication) => {
    const { expiresIn } = authentication.payload;
    if (!expiresIn) {
        return false;
    }
    const updatedAt = Date.parse(authentication.updated_at);
    const expiredFromThisTime = expiresIn * 1000 + updatedAt;
    const safeRefreshTime = expiredFromThisTime - 15 * 60 * 1000; // 15 minutes
    const isNowLaterThanSafeRefreshTime = Date.now() > safeRefreshTime;
    return isNowLaterThanSafeRefreshTime;
};
/**
 * Refresh an authentication based on the OAuth strategies
 * and the integration's configuration.
 *
 * @param integration - The integration config file
 * @param oldAuthentication - The old authentication
 * @returns authentication - The new authentication (saved in database)
 */
exports.refreshAuthentication = async (integration, oldAuthentication) => {
    const configuration = await database_1.configurations.get(integration.id, oldAuthentication.setup_id);
    if (integrations_1.isOAuth2(integration)) {
        const oldPayload = oldAuthentication.payload;
        const refreshToken = oldPayload.refreshToken;
        if (!refreshToken || refreshToken === common_1.NO_VALUE) {
            throw new error_handling_1.PizzlyError('token_refresh_missing');
        }
        const newPayload = await OAuth2.refresh(integration, configuration, oldAuthentication);
        const newAuthentication = {
            object: 'authentication',
            id: oldAuthentication.auth_id,
            auth_id: oldAuthentication.auth_id,
            setup_id: oldAuthentication.setup_id,
            payload: newPayload,
            created_at: oldAuthentication.created_at,
            updated_at: new Date().toISOString()
        };
        await database_1.authentications.update(oldAuthentication.auth_id, newAuthentication);
        return newAuthentication;
    }
    // TODO handle oauth1 token freshness
};
