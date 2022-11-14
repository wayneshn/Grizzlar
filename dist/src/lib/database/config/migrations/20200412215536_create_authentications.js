"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    // tslint:disable-next-line:ter-prefer-arrow-callback
    return knex.schema.createTable('authentications', function (t) {
        t.bigIncrements('id');
        t.string('buid');
        t.string('auth_id');
        t.json('user_attributes');
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTable('authentications');
}
exports.down = down;
