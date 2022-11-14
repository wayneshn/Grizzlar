"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSetupIdConsistency = void 0;
const errors_1 = require("../errors");
exports.checkSetupIdConsistency = ({ setupId, setupIdParam, setupIdFromRequest }) => {
    if (setupIdParam && setupIdParam !== setupId) {
        if (setupIdFromRequest) {
            throw new errors_1.InconsistentSetupId();
        }
    }
};
