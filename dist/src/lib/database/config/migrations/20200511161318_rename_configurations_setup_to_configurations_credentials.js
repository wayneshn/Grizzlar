"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.alterTable('configurations', function (table) {
        table.renameColumn('setup', 'credentials');
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.alterTable('configurations', function (table) {
        table.renameColumn('credentials', 'setup');
    });
}
exports.down = down;
