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
exports.destroySessionOnError = exports.destroySession = exports.session = void 0;
const express_session_1 = __importDefault(require("express-session"));
const connect_session_knex_1 = __importDefault(require("connect-session-knex"));
const knex_1 = __importDefault(require("knex"));
const config = __importStar(require("../../../lib/database/config/knexfile"));
const knexSessionStore = connect_session_knex_1.default(express_session_1.default);
exports.session = () => {
    const { connection, client } = config[process.env.NODE_ENV || 'development'];
    const knex = knex_1.default({ connection, client });
    return express_session_1.default({
        secret: process.env.COOKIE_SECRET || 'cookie-secret',
        cookie: { secure: 'auto' },
        resave: false,
        saveUninitialized: true,
        store: new knexSessionStore({ knex })
    });
};
exports.destroySession = (req, _res, next) => {
    req.session.destroy(next);
};
exports.destroySessionOnError = (err, req, _res, next) => {
    if (req.session) {
        req.session.destroy(destroyErr => {
            console.error(destroyErr);
        });
    }
    next(err);
};
