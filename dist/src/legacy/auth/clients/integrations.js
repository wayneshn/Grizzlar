"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSetupDetails = exports.saveSetupDetails = exports.getConfig = exports.getAuth = exports.updateAuth = void 0;
require("../../../../integrations");
exports.updateAuth = async ({ buid, authId, setupId, payload, store }) => {
    await store('authentications').insert({ buid, auth_id: authId, setup_id: setupId, payload });
};
exports.getAuth = async ({ buid, authId, store }) => {
    console.log('[getAuth] buid/authId', buid, authId);
    return (await store('authentications')
        .where({ buid, auth_id: authId })
        .first());
};
exports.getConfig = async ({ buid }) => {
    let item = {};
    try {
        item = require(`../../../../integrations/${buid}.json`);
    }
    catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            return false;
        }
    }
    const configItem = item.auth;
    if (configItem.authType) {
        configItem.authType = configItem.authType.toUpperCase();
    }
    return { ...configItem, authConfig: configItem, requestConfig: item.request };
};
exports.saveSetupDetails = async ({ buid, setupId, credentials, scopes, store }) => {
    await store('configurations').insert({ buid, credentials, scopes, setup_id: setupId });
};
exports.getSetupDetails = async ({ buid, setupId, store }) => {
    if (setupId) {
        return await store('configurations')
            .where({ buid, setup_id: setupId })
            .first();
    }
    return await store('configurations')
        .where({ buid })
        .orderBy('updated_at', 'desc')
        .first();
};
