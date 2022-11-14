"use strict";
/**
 * Basic operations with the ./integrations folder
 * to get or list the integrations within that folder.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOAuth1 = exports.isOAuth2 = exports.validateConfigurationCredentials = exports.validateConfigurationScopes = exports.get = exports.list = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const integrationsDir = path_1.default.join(__dirname, '../../../', 'integrations');
/**
 * List all integrations within the folder
 * @returns an array of the integrations configuration.
 */
exports.list = async () => {
    return new Promise((resolve, reject) => {
        fs_1.default.readdir(integrationsDir, function (err, integrationsFiles) {
            if (err) {
                return reject('Unable to access integrations directory.');
            }
            const apis = [];
            integrationsFiles.forEach(function (file) {
                const fileExtension = file.split('.').pop();
                if (fileExtension !== 'json') {
                    return;
                }
                try {
                    const fileName = file.slice(0, -5);
                    const fileContent = require(path_1.default.join(integrationsDir, `${fileName}.json`));
                    const integration = formatIntegration(fileName, fileContent);
                    apis.push(integration);
                }
                catch (err) { }
            });
            resolve(apis);
        });
    });
};
/**
 * Retrieve a particular integration within the folder.
 * @param apiName
 * @returns the integration configuration.
 */
exports.get = async (integrationName) => {
    return new Promise((resolve, reject) => {
        if (!integrationName) {
            return reject('Empty integration name provided.');
        }
        try {
            const fileContent = require(path_1.default.join(integrationsDir, `${integrationName}.json`));
            const integration = formatIntegration(integrationName, fileContent);
            return resolve(integration);
        }
        catch (err) {
            return reject(err);
        }
    });
};
const formatIntegration = (fileName, fileContent) => {
    const integration = fileContent;
    integration.id = fileName;
    integration.image =
        integration.image || 'https://logo.clearbit.com/' + integration.name.toLowerCase().replace(' ', '') + '.com';
    const isOAuth2Auth = isOAuth2(integration);
    integration.auth.setupKeyLabel = isOAuth2Auth ? 'Client ID' : 'Consumer Key';
    integration.auth.setupSecretLabel = isOAuth2Auth ? 'Client Secret' : 'Consumer Secret';
    return integration;
};
/**
 * Validation
 */
exports.validateConfigurationScopes = (scopesAsString) => {
    const scopes = (String(scopesAsString) || '').trim();
    return (scopes && scopes.split(/\r?\n/)) || null;
};
exports.validateConfigurationCredentials = (setup, integration) => {
    if (!setup) {
        return;
    }
    const authConfig = integration.auth;
    const isOAuth2 = authConfig.authType == 'OAUTH2';
    const isOAuth1 = authConfig.authType == 'OAUTH1';
    if (isOAuth1) {
        const consumerKey = String(setup.consumerKey);
        const consumerSecret = String(setup.consumerSecret);
        if (consumerKey && consumerSecret) {
            return { consumerKey, consumerSecret };
        }
    }
    else if (isOAuth2) {
        const clientId = String(setup.clientId);
        const clientSecret = String(setup.clientSecret);
        if (clientId && clientSecret) {
            return { clientId, clientSecret };
        }
    }
    return;
};
/*
  Helpers
*/
function isOAuth2(integration) {
    return integration.auth.authType === 'OAUTH2';
}
exports.isOAuth2 = isOAuth2;
function isOAuth1(integration) {
    return integration.auth.authType === 'OAUTH1';
}
exports.isOAuth1 = isOAuth1;
