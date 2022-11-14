"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    // tslint:disable-next-line:ter-prefer-arrow-callback
    return knex.schema.alterTable('authentications', function (table) {
        table.timestamps(true, true);
    });
}
exports.up = up;
async function down(knex) {
    // tslint:disable-next-line:ter-prefer-arrow-callback
    return knex.schema.alterTable('authentications', function (table) {
        table.dropTimestamps();
    });
}
exports.down = down;
