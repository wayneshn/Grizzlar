"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackAuthId = exports.connectAuthId = void 0;
const uuid_1 = require("uuid");
exports.connectAuthId = (req, res, next) => {
    const currentAuthId = req.query.authId;
    const authId = currentAuthId || uuid_1.v1();
    req.authId = authId;
    req.session.authId = authId;
    next();
};
exports.callbackAuthId = (req, _res, next) => {
    const { authId } = req.session;
    req.authId = authId;
    next();
};
