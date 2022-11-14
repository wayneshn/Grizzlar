"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupId = exports.proxyFunction = void 0;
const express_1 = require("express");
const errorHandler_1 = __importDefault(require("../../legacy/errorHandler"));
const cors_1 = require("../proxy/cors");
const strategy_1 = require("../auth/v3/strategy");
const lambda_request_1 = require("./lambda-request");
const intent_info_1 = require("../middlewares/v4/intent-info");
const integration_1 = __importDefault(require("./integration"));
const integrations_1 = require("../auth/clients/integrations");
const error_handling_1 = require("../../lib/error-handling");
const BUID = 'bearerUuid';
function functionsRouter() {
    const functionsRouter = express_1.Router({ mergeParams: true });
    functionsRouter.all(`${intent_info_1.PROXY_PREFIX}/*`, setupId, strategy_1.fetchAuthDetails, intent_info_1.setProxyFunction, lambda_request_1.middleware());
    functionsRouter.use((_req, res) => res.status(404).send());
    functionsRouter.use(errorHandler_1.default);
    return functionsRouter;
}
function proxyRouter() {
    const proxyRouter = express_1.Router({ mergeParams: true });
    proxyRouter.all(`/*`, strategy_1.fetchAuthDetails, intent_info_1.setProxyFunction, lambda_request_1.middleware);
    return proxyRouter;
}
function setProxyCallType(req, _res, next) {
    const apiKey = (req.headers && req.headers.authorization) || req.query.apiKey;
    if (apiKey) {
        req.isBackend = true;
    }
    else {
        req.isBackend = false;
    }
    next();
}
exports.default = () => {
    const router = express_1.Router();
    router.use(`/backend/:${BUID}`, buid, authId, isBackendRequest, functionsRouter());
    router.use(`/:${BUID}`, buid, authId, functionsRouter());
    router.use(errorHandler_1.default);
    return router;
};
function proxyFunction() {
    const router = express_1.Router();
    router.use(`/:${BUID}`, cors_1.proxyCorsMiddleware, buid, setupId, authId, setProxyCallType, proxyRouter());
    router.use(errorHandler_1.default);
    return router;
}
exports.proxyFunction = proxyFunction;
function authId(req, _res, next) {
    req.authId = req.headers['bearer-auth-id'] || req.headers['pizzly-auth-id'] || req.query.authId;
    next();
}
function buid(req, _res, next) {
    req.buid = req.params[BUID];
    req.integration = new integration_1.default(req.buid);
    next();
}
async function setupId(req, _res, next) {
    const configuration = await integrations_1.getSetupDetails({ buid: req.buid, store: req.store, setupId: req.query.setupId });
    if (!configuration) {
        return next(new error_handling_1.PizzlyError('unknown_configuration'));
    }
    req.setupId = configuration.setupId;
    req.configuration = configuration;
    next();
}
exports.setupId = setupId;
function isBackendRequest(req, _res, next) {
    req.isBackend = true;
    next();
}
