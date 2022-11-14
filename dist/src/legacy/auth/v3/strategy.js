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
exports.fetchAuthDetails = exports.authenticate = exports.isOAuthType = void 0;
const types_1 = require("./types");
const errors_1 = require("./errors");
const oauth1 = __importStar(require("./strategies/oauth1"));
const oauth2 = __importStar(require("./strategies/oauth2"));
const errorHandler_1 = require("../../errorHandler");
const strategies = {
    [types_1.EAuthType.OAuth1]: oauth1,
    [types_1.EAuthType.OAuth2]: oauth2
};
exports.isOAuthType = (authType) => [types_1.EAuthType.OAuth1, types_1.EAuthType.OAuth2].includes(authType);
exports.authenticate = (req, res, next) => {
    const { authType } = req.integrationConfig;
    strategies[authType].authenticate(req, res, next);
};
exports.fetchAuthDetails = errorHandler_1.asyncMiddleware(async (req, _res, next) => {
    const { buid, authId, integration, configuration } = req;
    const integrationConfig = await integration.config();
    const { authType } = integrationConfig;
    if (!Object.values(types_1.EAuthType).includes(authType)) {
        throw new errors_1.InvalidAuthType(authType);
    }
    const strategy = strategies[authType];
    const params = {
        buid,
        authId,
        integration,
        configuration,
        store: req.store
    };
    req.auth = await strategy.fetchAuthDetails(params, integrationConfig);
    console.log('[fetchAuthDetails] Auth', req.auth);
    next();
});
