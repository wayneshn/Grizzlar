"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAuthDetails = exports.nullAuthDetails = exports.authenticate = void 0;
const passport_1 = __importDefault(require("passport"));
const oauth_1 = require("oauth");
const passport_oauth1_1 = __importDefault(require("passport-oauth1"));
const cls_hooked_1 = require("cls-hooked");
const types_1 = require("../types");
const errors_1 = require("../errors");
// import { getSetupDetails, getAuth, TOAuth1Payload } from '../../../clients/integrations'
const setup_id_consistency_1 = require("./setup-id-consistency");
const responseData = cls_hooked_1.createNamespace('BearerOAuth1ResponseData');
const originalCreateClient = oauth_1.OAuth.prototype._createClient;
oauth_1.OAuth.prototype._createClient = function (...args) {
    responseData.set('response', undefined);
    const request = originalCreateClient.apply(this, args);
    request.once('response', response => {
        responseData.set('response', response);
    });
    return request;
};
class Strategy extends passport_oauth1_1.default {
    constructor(options, verify) {
        super(options, verify);
        this._authorizationParams = options.authorizationParams;
        this._tokenParams = options.tokenParams;
    }
    userAuthorizationParams() {
        return this._authorizationParams || {};
    }
    requestTokenParams() {
        return this._tokenParams || {};
    }
    parseErrorResponse(body, statusCode) {
        return new errors_1.AuthenticationFailed({ statusCode, body });
    }
}
const strategyOptions = (req) => {
    const callbackURL = process.env.AUTH_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/callback`;
    const { consumerKey, consumerSecret } = req.setupDetails.credentials;
    const { requestTokenURL, tokenParams, accessTokenURL, userAuthorizationURL, authorizationParams, signatureMethod } = req.integrationConfig;
    return {
        consumerKey,
        consumerSecret,
        requestTokenURL,
        tokenParams,
        accessTokenURL,
        userAuthorizationURL,
        authorizationParams,
        signatureMethod,
        callbackURL
    };
};
const parseExpires = (expiresIn) => {
    if (!expiresIn) {
        return 0;
    }
    const result = parseInt(expiresIn, 10);
    if (isNaN(result)) {
        return 0;
    }
    return result;
};
exports.authenticate = (req, res, next) => {
    // This is invoked after we've been called back by the third party, and when Passport
    // thinks we've succesfully got a token
    const verify = (accessToken, tokenSecret, params, _profile, verified) => {
        if (!accessToken) {
            return verified(undefined, undefined, { message: 'No access token returned', response: params });
        }
        const { consumerKey, consumerSecret } = req.setupDetails;
        const credentials = {
            consumerKey,
            consumerSecret,
            accessToken,
            tokenSecret,
            expiresIn: parseExpires(params.expires_in)
        };
        // The OAuth library removes the token/secret from the body data.
        // Add them back in so we can store the response data as it was originally received
        const body = {
            ...params,
            oauth_token: accessToken,
            oauth_token_secret: tokenSecret
        };
        verified(undefined, { body, credentials });
    };
    // This is invoked at the end of the Passport process when either an error has occurred,
    // authentication failed, or we have successfully authenticated. This might have been invoked
    // as a consequence of the `verified` callback above, or by Passport internally
    const authenticateCallback = (err, data, info) => {
        if (err) {
            return next(err);
        }
        if (!data) {
            return next(errors_1.AuthenticationFailed.fromOAuthRequest(req, info));
        }
        const { body, credentials } = data;
        req.credentials = credentials;
        req.tokenResponse = {
            body,
            headers: responseData.get('response').headers
        };
        next();
    };
    responseData.run(() => {
        passport_1.default.use(new Strategy(strategyOptions(req), verify));
        passport_1.default.authenticate('oauth', authenticateCallback)(req, res, next);
    });
};
exports.nullAuthDetails = {
    accessToken: null,
    tokenSecret: null,
    consumerKey: null,
    consumerSecret: null,
    signatureMethod: null
};
exports.fetchAuthDetails = async (params, integrationConfig) => {
    const { buid, 
    // servicesTableName,
    // scopedUserDataTableName,
    // environmentIdentifier,
    // integration,
    authId, setupIdFromRequest, setupId: setupIdParam } = params;
    const { signatureMethod = types_1.OAuth1SignatureMethod.HmacSha1 } = integrationConfig;
    const credentials = {
        accessToken: 'accessToken',
        callbackParamsJSON: '{}',
        connectParams: {},
        expiresIn: 1234567890,
        tokenSecret: 'tokenSecret',
        setupId: 'setupId',
        updatedAt: 1234567890,
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret'
    };
    // const credentials = await getAuth<TOAuth1Payload>({
    //   servicesTableName,
    //   buid: integration.buid,
    //   authId: authId!,
    //   clientId: environmentIdentifier
    // })
    if (!credentials || !credentials.accessToken) {
        throw new errors_1.InvalidAuthId(buid, authId);
    }
    const { accessToken, callbackParamsJSON, connectParams = {}, expiresIn, tokenSecret, setupId, updatedAt } = credentials;
    const { consumerKey, consumerSecret } = credentials;
    setup_id_consistency_1.checkSetupIdConsistency({ setupId, setupIdParam, setupIdFromRequest });
    const callbackParams = callbackParamsJSON ? JSON.parse(callbackParamsJSON) : undefined;
    if (!consumerKey || !consumerSecret) {
        // tslint:disable-next-line:semicolon
        // ;({ consumerKey, consumerSecret } = await getSetupDetails({
        //   scopedUserDataTableName,
        //   buid: integration.buid,
        //   setupId: setupId!,
        //   clientId: environmentIdentifier
        // }))
    }
    return {
        accessToken,
        callbackParams,
        connectParams,
        expiresIn,
        tokenSecret,
        consumerKey,
        consumerSecret,
        signatureMethod,
        updatedAt
    };
};
