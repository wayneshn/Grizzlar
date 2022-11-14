"use strict";
/**
 * Handle SQL queries to the configurations' table
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.getConfiguration = void 0;
const _1 = require(".");
/**
 * Retrieve a configuration from the database
 * @param integration (string) - The integration name
 * @param id (string)- The configuration ID
 */
exports.getConfiguration = async (integration, id) => {
    // Retrieve the matching configuration and id
    if (id) {
        return await _1.store('configurations')
            .where({ buid: integration, setup_id: id })
            .first();
    }
    // Or retrieve the latest one
    return await _1.store('configurations')
        .where({ buid: integration })
        .orderBy('updated_at', 'desc')
        .first();
};
exports.get = exports.getConfiguration; // Alias
