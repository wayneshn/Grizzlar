"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandAuthConfig = void 0;
const lodash_pick_1 = __importDefault(require("lodash.pick"));
const template_1 = require("./template");
const errors_1 = require("./errors");
const labels = {
    accessTokenURL: 'Access Token URL',
    authorizationURL: 'Authorization URL',
    authorizationParams: 'Authorization Param',
    requestTokenURL: 'Request Token URL',
    tokenParams: 'Token Param',
    tokenURL: 'Token URL',
    refreshURL: 'Refresh URL',
    userAuthorizationURL: 'User Authorization URL'
};
exports.expandAuthConfig = ({ connectParams, authConfig }) => {
    const template = lodash_pick_1.default(authConfig, 'accessTokenURL', 'authorizationURL', 'authorizationParams', 'requestTokenURL', 'tokenParams', 'tokenURL', 'refreshURL', 'userAuthorizationURL');
    try {
        return {
            ...authConfig,
            ...template_1.expandTemplate(template, { connectParams })
        };
    }
    catch (e) {
        if (!(e instanceof template_1.UndefinedVariable)) {
            throw e;
        }
        const { templatePath, variableName } = e;
        const [attributeName, subAttributeName] = templatePath.split('.');
        const label = labels[attributeName];
        if (e.variableName.startsWith('connectParams.')) {
            throw new errors_1.MissingApiConfigConnectParam(label, subAttributeName, variableName);
        }
        throw new errors_1.InvalidApiConfig(label, subAttributeName, variableName);
    }
};
