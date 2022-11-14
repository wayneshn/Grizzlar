"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSuccess = void 0;
const errorHandler_1 = require("../../../legacy/errorHandler");
const integrations_1 = require("../clients/integrations");
exports.authSuccess = errorHandler_1.asyncMiddleware(async (req, res) => {
    const { connectParams, setupId, authId, credentials, store, configuration } = req;
    const buid = req.buid;
    const payload = {
        connectParams,
        setupId,
        serviceName: buid,
        userId: authId,
        updatedAt: Date.now(),
        ...credentials
    };
    if (configuration && configuration.scopes) {
        console.log('[authSuccess] scopes', configuration.scopes);
        payload.scopes = configuration.scopes;
    }
    if (req.tokenResponse) {
        payload.tokenResponseJSON = JSON.stringify(req.tokenResponse);
    }
    if (req.isCallback) {
        payload.callbackParamsJSON = JSON.stringify(req.query);
    }
    const params = {
        buid,
        authId,
        setupId,
        payload
    };
    await integrations_1.updateAuth({ ...params, store });
    res.header('Content-Type', 'text/html');
    res.render('auth/callback', { authId, error: '', error_description: '', integrationUuid: buid });
});
