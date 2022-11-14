"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectBuid = void 0;
exports.connectBuid = (req, _res, next) => {
    const { buid } = req.params;
    req.buid = buid;
    next();
};
