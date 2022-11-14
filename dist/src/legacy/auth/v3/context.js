"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackContext = exports.connectContext = void 0;
const errors_1 = require("../../errors");
const errors_2 = require("./errors");
const errorHandler_1 = require("../../errorHandler");
const getConnectParams = (params) => {
    if (params === undefined) {
        return {};
    }
    if (typeof params !== 'object' || Array.isArray(params)) {
        throw new InvalidConnectParams();
    }
    for (const [name, value] of Object.entries(params)) {
        if (typeof value !== 'string' || !/^[\w\s.-]*$/.test(value)) {
            throw new InvalidConnectParam(name);
        }
    }
    return params;
};
exports.connectContext = (req, res, next) => {
    const { buid, setupId } = req;
    const connectParams = getConnectParams(req.query.params);
    req.session.context = {
        connectParams,
        setupId,
        buid
    };
    req.connectParams = connectParams;
    next();
};
exports.callbackContext = errorHandler_1.asyncMiddleware(async (req, _res, next) => {
    if (!req.session.context) {
        throw new errors_2.NoAuthInProgress();
    }
    const { buid, connectParams } = req.session.context;
    req.isCallback = true;
    req.connectParams = connectParams;
    req.buid = buid;
    req.setupId = req.session.authConfig.setupDetails.setup_id;
    next();
});
class InvalidConnectParams extends errors_1.UserError {
    constructor() {
        super(
        // tslint:disable:max-line-length
        `Incorrect format for connect parameters'

Connect parameters must be sent as query parameters of the form \`params[name]=value\` eg. \`params[subdomain]=my-app\`'`, 
        // tslint:enable:max-line-length
        400, 'INVALID_CONNECT_PARAMS');
    }
}
class InvalidConnectParam extends errors_1.UserError {
    constructor(name) {
        super(`Incorrect format for connect parameter '${name}'

Connect parameters may contain alphanumeric and space characters, or any of the following symbols '_-.'

Refer to this link for further information: https://docs.bearer.sh/faq/connect-button`, 400, 'INVALID_CONNECT_PARAM');
    }
}
