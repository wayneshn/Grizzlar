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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.BUID = void 0;
const express_1 = __importDefault(require("express"));
const node_agent_1 = __importDefault(require("@bearer/node-agent"));
const telemetry_1 = __importDefault(require("./lib/telemetry"));
const routes = __importStar(require("./routes"));
const serverless_http_1 = __importDefault(require("serverless-http"));
exports.BUID = 'bearerUid'; // TODO - What is this for?
exports.PORT = process.env.PORT || 8080;
console.log(process.env.PORT);
const app = express_1.default();
app.set('view engine', 'ejs');
app.set('views', './views');
app.set('trust proxy', 1);
/**
 * Force HSTS
 */
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
/**
 * Log request
 */
app.use((req, _res, next) => {
    console.log(req.method, req.path);
    next();
});
/**
 * Assets
 */
app.use('/assets', express_1.default.static('./views/assets'));
/**
 * Pizzly's homepage
 */
app.get('/', routes.home);
/**
 * API endpoints
 */
app.use('/api', routes.api);
/**
 * Authentication endpoints
 */
app.use('/auth', routes.auth);
/**
 * Dashboard
 */
app.use('/dashboard', routes.dashboard);
/**
 * Proxy feature
 */
app.use('/proxy', routes.proxy);
/**
 * Legacy endpoints
 *
 * Pizzly is a fork of a previous codebase made by Bearer.sh engineering team.
 * To help the migration of Bearer's users, we keep here some legacy endpoints.
 * It's very likely that these endpoints will be removed by the end of 2020,
 * so please do not rely on these endpoints anymore.
 */
app.use('/v2/auth', routes.legacy.auth);
app.use('/apis', routes.legacy.apis);
app.use('/api/v4/functions', routes.legacy.proxy);
/**
 * Error handling
 */
app.use((_req, res, _next) => {
    res.status(404).render('errors/404');
});
app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status && Number(err.status);
    if (status && status >= 400 && status < 500) {
        res.status(status).render('errors/' + err.status);
    }
    else {
        res.status(500).render('errors/500');
    }
});
/**
 * Starting up the server
 */
if (process.env.ENVIRONMENT === 'lambda') {
    module.exports.handler = serverless_http_1.default(app);
}
else {
    app.listen(exports.PORT, async () => {
        // Log start up
        console.log('Pizzly listening on port', exports.PORT);
        if (exports.PORT === 8080) {
            console.log('http://localhost:8080');
        }
        // Initialize Telemetry (if enabled)
        process.env.UUID = telemetry_1.default();
    });
}
/**
 * Optional. Initialize the Bearer agent if the environment key is provided.
 * Bearer will monitor and shield the Pizzly instance from APIs failure.
 * Learn more: https://www.bearer.sh/
 *
 * To get your BEARER_SECRET_KEY, create an account on www.bearer.sh
 * then heads to https://app.bearer.sh/settings/key
 */
if (process.env.BEARER_SECRET_KEY) {
    node_agent_1.default.init();
}
