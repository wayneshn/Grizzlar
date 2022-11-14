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
exports.apis = exports.proxy = exports.auth = void 0;
const express = __importStar(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = require("../legacy/proxy/cors");
const router_1 = __importStar(require("../legacy/auth/v3/router"));
const database_1 = require("../lib/database");
const router_2 = __importDefault(require("../legacy/functions/router"));
const legacy = express.Router();
legacy.use(body_parser_1.default.urlencoded({ extended: false }));
legacy.use(body_parser_1.default.json({ limit: '5mb' }));
/**
 * Legacy endpoints for authentication.
 *
 * In Bearer.sh, users where triggering an OAuth dance by requesting:
 * ${hostname}/v2/auth/[API-NAME]?clientId=[SECRET-KEY]
 *
 * In return, they had to register the following callback URL
 * ${hostname}/v2/auth/callback
 * */
const auth = legacy.use('/', cors_1.cors, database_1.initializeDB, router_1.default());
exports.auth = auth;
/**
 * Legacy endpoints for the proxy feature
 *
 * In Bearer.sh, users where also able to use a proxy that was populating
 * each request to the distant API with the right credentials. It was working like this
 * ${hostname}/api/v4/functions/[API-NAME]/[ENDPOINT-PATH]
 */
const proxy = legacy.use('/', cors_1.cors, database_1.initializeDB, router_2.default());
exports.proxy = proxy;
/**
 * TODO - What was this for?
 * @cfabianski might be helpful here.
 */
const apis = legacy.use('/', cors_1.cors, database_1.initializeDB, router_1.authRouter());
exports.apis = apis;
