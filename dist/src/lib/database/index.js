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
exports.integrations = exports.configurations = exports.authentications = exports.initializeDB = exports.store = exports.dbClient = void 0;
const knex_1 = __importDefault(require("knex"));
const config_1 = require("./config");
const authentications = __importStar(require("./authentications"));
exports.authentications = authentications;
const configurations = __importStar(require("./configurations"));
exports.configurations = configurations;
const integrations = __importStar(require("./integrations"));
exports.integrations = integrations;
exports.dbClient = function () {
    return knex_1.default({
        connection: config_1.connection,
        client: 'pg',
        pool: {
            min: 2,
            max: 5
        }
    });
};
exports.store = exports.dbClient();
exports.initializeDB = function (req, res, next) {
    req.store = exports.store;
    next();
};
