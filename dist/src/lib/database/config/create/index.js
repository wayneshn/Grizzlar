"use strict";
/**
 * Create the Pizzly database if does not exists yet.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const config = __importStar(require("../knexfile"));
const pg_1 = require("pg");
(async () => {
    if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
        return; // skip database creation if not on development
    }
    if (process.env.HEROKU_POSTGRESQL_ONYX_URL || process.env.DATABASE_URL) {
        return; // skip database creation on heroku or special database configuration
    }
    const { connection, client } = config['development'];
    if (client && client === 'pg' && connection && connection.database) {
        const database = connection.database;
        connection.database = 'postgres'; // pg default database
        const client = new pg_1.Client(connection);
        await client.connect();
        client
            .query(`CREATE DATABASE ${database}`)
            .catch(err => {
            if (err.message !== `database "${database}" already exists`) {
                console.error(err);
            }
        })
            .then(() => client.end());
    }
})();
