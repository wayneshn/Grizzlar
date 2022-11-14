"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Update with your config settings.
const _1 = require(".");
module.exports = {
    development: {
        connection: _1.connection,
        client: 'pg',
        pool: {
            min: 2,
            max: 5
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
    production: {
        connection: _1.connection,
        client: 'pg',
        pool: {
            min: 2,
            max: 5
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations',
            ext: 'ts'
        }
    }
};
