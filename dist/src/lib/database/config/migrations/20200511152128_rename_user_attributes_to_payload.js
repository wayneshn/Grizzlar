"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.alterTable('authentications', function (table) {
        table.renameColumn('user_attributes', 'payload');
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.alterTable('authentications', function (table) {
        table.renameColumn('payload', 'user_attributes');
    });
}
exports.down = down;
