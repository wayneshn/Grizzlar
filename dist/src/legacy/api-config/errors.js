"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingApiConfigConnectParam = exports.MissingApiConfigHeader = exports.InvalidApiConfig = void 0;
const errors_1 = require("../errors");
class InvalidApiConfig extends errors_1.UserError {
    constructor(label, subAttribute, variableName) {
        const subText = subAttribute ? ` '${subAttribute}'` : '';
        super(`The API's ${label}${subText} has been configured with an invalid variable \${${variableName}}.`, 422, 'INVALID_API_CONFIG');
    }
}
exports.InvalidApiConfig = InvalidApiConfig;
class MissingApiConfigHeader extends errors_1.UserError {
    constructor(label, subAttribute, variableName) {
        const subText = subAttribute ? ` '${subAttribute}'` : '';
        const header = variableName.split('.')[1];
        super(`The API's ${label}${subText} configuration requires the '${header}' header to be passed with each request.`, 400, 'MISSING_API_CONFIG_HEADER');
    }
}
exports.MissingApiConfigHeader = MissingApiConfigHeader;
class MissingApiConfigConnectParam extends errors_1.UserError {
    constructor(label, subAttribute, variableName) {
        const subText = subAttribute ? ` '${subAttribute}'` : '';
        const param = variableName.split('.')[1];
        super(
        // tslint:disable-next-line:max-line-length
        `The API's ${label}${subText} configuration requires the '${param}' query parameter to be passed when connecting.`, 400, 'MISSING_API_CONFIG_HEADER');
    }
}
exports.MissingApiConfigConnectParam = MissingApiConfigConnectParam;
