"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revoke = void 0;
const errorHandler_1 = require("../../errorHandler");
const errors_1 = require("../../errors");
exports.revoke = errorHandler_1.asyncMiddleware(async (req, res) => {
    // const { authId } = req.params
    // const { buid } = req
    const { clientId } = req.query;
    if (!clientId) {
        throw new errors_1.MissingParameter('clientId');
    }
    // await revokeAuthV3({
    //   clientId,
    //   buid,
    //   authId,
    //   servicesTableName: req.stageVariables.servicesTableId
    // })
    res.status(200).end();
});
