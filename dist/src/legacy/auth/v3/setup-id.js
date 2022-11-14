"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectSetupId = void 0;
exports.connectSetupId = (req, _res, next) => {
    const setupId = req.setupId;
    // if (!setupId) {
    //   throw new MissingParameter('setupId')
    // }
    req.session.context.setupId = setupId;
    next();
};
