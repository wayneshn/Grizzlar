"use strict";
/**
 * Proxy feature
 *
 * Use Pizzly as a proxy to make authenticated
 * requests to third-party APIs.
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxy = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const access = __importStar(require("../lib/access"));
const proxy_1 = require("../lib/proxy");
const asyncMiddleware_1 = require("../lib/utils/asyncMiddleware");
const interpolation_1 = require("../lib/proxy/interpolation");
const proxy = express_1.default.Router();
exports.proxy = proxy;
/**
 * Proxy authentication middleware
 *
 * Authenticated requests to the proxy service can use both a publishable key
 * (using ?pizzly_pkey=... as a query string) or a secret key (using
 * the Authentication header).
 *
 * By default requests using a publishable key are allowed, even if, as its name
 * implies, the publishable key is public (available in your website source code).
 * It's still considered safe, as you need both a valid publishable key and authId
 * to make requests to a third party API.
 */
proxy.use((req, res, next) => {
    // Limit access to the requests having a valid secret key only
    const proxyUsesSecretKeyOnly = process.env.PROXY_USES_SECRET_KEY_ONLY === 'TRUE';
    if (!proxyUsesSecretKeyOnly && req.query['pizzly_pkey']) {
        return access.publishableKey(req, res, next);
    }
    else {
        return access.secretKey(req, res, next);
    }
});
/**
 * Enable CORS on proxy requests
 */
proxy.use(cors_1.default());
/**
 * Handle proxy requests.
 *
 * Some examples:
 *  - GET /github/user/ will retrieve information from GitHub API on the "/user" endpoint
 *  - POST /slack/reminders.add will create a reminder on Slack API "/reminders.add" endpoint.
 */
proxy.all('/:integration*', asyncMiddleware_1.asyncMiddleware(proxy_1.incomingRequestHandler));
/**
 * Error handling
 */
proxy.use((req, res, next) => {
    return res.status(404).json({ error: { type: 'missing', message: 'Resource not found' } });
});
proxy.use((err, req, res, next) => {
    let status = 400;
    let type = 'invalid';
    let message = 'Bad request';
    if (err instanceof interpolation_1.UndefinedVariable) {
        status = 422;
        type = 'invalid_proxy_configuration_interpolation';
        message = `Proxy configuration template interpolation error: ${err.message}`;
    }
    else if (err.type && err.status && err.message) {
        status = err.status;
        type = err.type;
        message = err.message;
    }
    else {
        console.error(err);
    }
    return res.status(status).json({ error: { type, message } });
});
