"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsNotConfigured = exports.MissingAuthId = exports.InvalidAuthId = exports.InconsistentSetupId = exports.AccessTokenExpired = exports.AuthenticationFailed = exports.OAuthOnlyEndpoint = exports.InvalidGrantType = exports.InvalidAuthType = exports.NoAuthInProgress = void 0;
const errors_1 = require("../../errors");
const types_1 = require("./types");
const oauth2_1 = require("./strategies/oauth2");
class NoAuthInProgress extends errors_1.UserError {
    constructor() {
        super(`The callback was invoked whilst no authentication was in progress. ` +
            `Either too much time has elapsed between starting authentication and the callback being invoked, ` +
            `or the callback was invoked without first calling the integration's authentication endpoint. Please try again`, 422, 'NO_AUTH_IN_PROGRESS');
    }
}
exports.NoAuthInProgress = NoAuthInProgress;
class InvalidAuthType extends errors_1.UserError {
    constructor(authType) {
        const allowedValues = Object.values(types_1.EAuthType)
            .map(authType => `'${authType}'`)
            .join(', ');
        super(`Invalid authType '${authType}'. Please check the integration's auth.config.json file. ` +
            `Allowed values are ${allowedValues}`, 422, 'INVALID_AUTH_TYPE');
    }
}
exports.InvalidAuthType = InvalidAuthType;
class InvalidGrantType extends errors_1.UserError {
    constructor(grantType) {
        const allowedValues = Object.values(oauth2_1.GrantType)
            .map(grantType => `'${grantType}'`)
            .join(', ');
        super(`Invalid grantType '${grantType}'. Please check the API's configuration. ` +
            `Allowed values are ${allowedValues}`, 422, 'INVALID_GRANT_TYPE');
    }
}
exports.InvalidGrantType = InvalidGrantType;
class OAuthOnlyEndpoint extends errors_1.UserError {
    constructor(authType) {
        super("This endpoint is only for 'OAUTH1' and 'OAUTH2' auth types " +
            `but the integration is configured with authType '${authType}'`, 422, 'OAUTH_ONLY_ENDPOINT');
    }
}
exports.OAuthOnlyEndpoint = OAuthOnlyEndpoint;
class AuthenticationFailed extends errors_1.UserError {
    constructor(details) {
        super(`Authentication failed:\n${JSON.stringify(details, undefined, 2)}`, 403, 'AUTHENTICATION_FAILED');
        if (details.error) {
            this.error = details.error;
            this.errorDescription = details.error_description;
        }
        else {
            this.errorDescription = this.error = JSON.stringify(details);
        }
    }
    static fromOAuthRequest(req, info) {
        if (req.query.error) {
            return new AuthenticationFailed(req.query);
        }
        return new AuthenticationFailed(info);
    }
}
exports.AuthenticationFailed = AuthenticationFailed;
class AccessTokenExpired extends errors_1.UserError {
    constructor() {
        super(`The access token associated with your Auth Id has expired and token refreshing is not supported for \
this API. Please reconnect to obtain a new access token.

Consult the API provider's documentation to determine whether refresh tokens can be enabled for this API`, 403, 'ACCESS_TOKEN_EXPIRED');
    }
}
exports.AccessTokenExpired = AccessTokenExpired;
class InconsistentSetupId extends errors_1.UserError {
    constructor() {
        super('The provided setupId does not match the setupId used when connecting. ' +
            'Please reconnect using this setupId, or retry this call with the ' +
            'setupId corresponding to the authId', 422, 'INCONSISTENT_SETUP_ID');
    }
}
exports.InconsistentSetupId = InconsistentSetupId;
class InvalidAuthId extends errors_1.UserError {
    constructor(buid, authId) {
        super(`No auth details were found using authId '${authId}' for API '${buid}'

Please try again with a valid authId or connect with this authId`, 404, 'INVALID_AUTH_ID');
    }
}
exports.InvalidAuthId = InvalidAuthId;
class MissingAuthId extends errors_1.UserError {
    constructor(buid) {
        super(`You must supply an authId to use the '${buid}' API

Please try again with a valid authId.

See the following link for information on how to obtain an authId: https://docs.bearer.sh/faq/connect-button`, 401, 'MISSING_AUTH_ID');
    }
}
exports.MissingAuthId = MissingAuthId;
class CredentialsNotConfigured extends errors_1.UserError {
    constructor(buid) {
        super(`Missing credentials for the '${buid}' API

Please configure the credentials in the dashboard and try again.

See the following link for information: https://docs.bearer.sh/dashboard/apis`, 422, 'CREDENTIALS_NOT_CONFIGURED');
    }
}
exports.CredentialsNotConfigured = CredentialsNotConfigured;
