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
exports.legacy = exports.proxy = exports.home = exports.dashboard = exports.auth = exports.api = void 0;
const api_1 = require("./api");
Object.defineProperty(exports, "api", { enumerable: true, get: function () { return api_1.api; } });
const auth_1 = require("./auth");
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return auth_1.auth; } });
const dashboard_1 = require("./dashboard");
Object.defineProperty(exports, "dashboard", { enumerable: true, get: function () { return dashboard_1.dashboard; } });
const home_1 = require("./home");
Object.defineProperty(exports, "home", { enumerable: true, get: function () { return home_1.home; } });
const proxy_1 = require("./proxy");
Object.defineProperty(exports, "proxy", { enumerable: true, get: function () { return proxy_1.proxy; } });
const legacy = __importStar(require("./legacy"));
exports.legacy = legacy;
