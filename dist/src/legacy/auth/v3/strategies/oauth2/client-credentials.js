"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const oauth2_1 = require("../../../clients/oauth2");
const errorHandler_1 = require("../../../../errorHandler");
const common_1 = require("./common");
exports.authenticate = errorHandler_1.asyncMiddleware(async (req, _res, next) => {
    const { authorizationMethod, bodyFormat, config, tokenURL } = req.integrationConfig;
    const { scope = [] } = config || {};
    const { clientId, clientSecret } = req.setupDetails.credentials;
    const tokenResult = await oauth2_1.getTokenWithClientCredentials({
        authorizationMethod,
        bodyFormat,
        clientId,
        clientSecret,
        scope,
        tokenURL
    });
    req.credentials = common_1.responseToCredentials(tokenResult);
    req.tokenResponse = tokenResult.decodedResponse;
    next();
});
