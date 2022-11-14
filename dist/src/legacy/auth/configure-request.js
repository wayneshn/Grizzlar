"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAuthDetailsRequest = void 0;
const errorHandler_1 = require("../errorHandler");
const integration_1 = __importDefault(require("../functions/integration"));
exports.configureAuthDetailsRequest = errorHandler_1.asyncMiddleware(async (req, _res, next) => {
    const { buid, authId } = req.params;
    req.authId = authId;
    console.log('[configureAuthDetailsRequest] buid', buid);
    console.log('[configureAuthDetailsRequest] authId', authId);
    req.integration = new integration_1.default(buid);
    console.log('[configureAuthDetailsRequest] integration', JSON.stringify(req.integration));
    next();
});
