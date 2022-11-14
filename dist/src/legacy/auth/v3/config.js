"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackConfig = exports.connectConfig = void 0;
const errorHandler_1 = require("../../errorHandler");
const types_1 = require("./types");
const integrations_1 = require("../clients/integrations");
const errors_1 = require("./errors");
const auth_config_1 = require("../../api-config/auth-config");
const getAuthConfig = async (req) => {
    const { connectParams, buid, configuration } = req;
    return {
        setupDetails: configuration,
        integrationConfig: auth_config_1.expandAuthConfig({
            connectParams,
            authConfig: (await integrations_1.getConfig({
                buid: buid
            }))
        })
    };
};
const copyConfig = (src, dest) => {
    dest.integrationConfig = src.integrationConfig;
    dest.setupDetails = src.setupDetails;
};
exports.connectConfig = errorHandler_1.asyncMiddleware(async (req, _res, next) => {
    const authConfig = await getAuthConfig(req);
    const { authType } = authConfig.integrationConfig;
    if (!Object.values(types_1.EAuthType).includes(authType)) {
        throw new errors_1.InvalidAuthType(authType);
    }
    copyConfig(authConfig, req);
    req.session.authConfig = authConfig;
    next();
});
exports.callbackConfig = (req, _res, next) => {
    copyConfig(req.session.authConfig, req);
    next();
};
