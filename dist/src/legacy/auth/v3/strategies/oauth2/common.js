"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdTokenJwt = exports.responseToCredentials = exports.NO_VALUE = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.NO_VALUE = 'non';
exports.responseToCredentials = ({ accessToken, refreshToken, idToken, expiresIn }) => {
    const credentials = {
        accessToken,
        refreshToken: refreshToken || exports.NO_VALUE,
        idToken: idToken || exports.NO_VALUE,
        expiresIn: expiresIn || 0
    };
    if (idToken) {
        credentials.idTokenJwt = exports.getIdTokenJwt(idToken);
    }
    return credentials;
};
exports.getIdTokenJwt = (idToken) => {
    if (!idToken) {
        return undefined;
    }
    try {
        return jsonwebtoken_1.default.decode(idToken) || undefined;
    }
    catch (e) {
        return undefined;
    }
};
