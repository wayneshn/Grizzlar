"use strict";
/**
 * Homepage
 *
 * Gives useful links to a new developer who's getting started on Pizzly.
 * This URL might be unavailable after authentication has been enabled.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.home = void 0;
const express = __importStar(require("express"));
const access = __importStar(require("../lib/access"));
const home = express.Router();
exports.home = home;
/**
 * Secure access to the homepage using BASIC authentication method
 */
home.use('*', access.basic);
/**
 * Render the homepage
 */
home.get('/', (req, res) => {
    res.render('home');
});
