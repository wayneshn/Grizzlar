"use strict";
/**
 * Auth (authentication) routes
 *
 * These routes handle the OAuth-dances (with support of OAuth2.0 and OAuth1.a).
 * Most code is "legacy", meaning it's an ongoing transition from Bearer.sh previous
 * codebase to this new repo. Feel free to contribute to make this transition faster.
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
exports.auth = void 0;
const express = __importStar(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const router_1 = __importDefault(require("../legacy/auth/v3/router"));
const database_1 = require("../lib/database");
const { COOKIE_SECRET } = process.env;
const auth = express.Router();
exports.auth = auth;
/**
 * Parse the body
 */
auth.use(body_parser_1.default.urlencoded({ extended: false }));
auth.use(body_parser_1.default.json({ limit: '5mb' }));
auth.use(cookie_parser_1.default(COOKIE_SECRET || 'cookie-secret'));
auth.use(passport_1.default.initialize());
/**
 * Use legacy endpoint to handle OAuth-dance
 */
auth.use('/', database_1.initializeDB, router_1.default());
