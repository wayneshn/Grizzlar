"use strict";
/**
 * Handle SQL queries to the authentications' table
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.get = exports.getAuthentication = void 0;
const _1 = require(".");
/**
 * Retrieve an authentication from the database
 *
 * @param authId (string) - The authentication ID
 */
exports.getAuthentication = async (integration, authId) => {
    return await _1.store('authentications')
        .select('id', 'auth_id', 'payload', 'created_at', 'updated_at')
        .where({ buid: integration, auth_id: authId })
        .first();
};
exports.get = exports.getAuthentication; // Alias
/**
 * Update an authentication with new data
 *
 * @param authId (string) - The authentication ID
 */
exports.update = async (authId, newAuthentication) => {
    const newRecord = {
        auth_id: newAuthentication.auth_id,
        setup_id: newAuthentication.setup_id,
        payload: newAuthentication.payload,
        updated_at: new Date()
    };
    return await _1.store('authentications')
        .where({ auth_id: authId })
        .update(newRecord);
};
