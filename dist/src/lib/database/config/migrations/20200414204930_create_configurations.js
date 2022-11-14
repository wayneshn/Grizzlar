"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    // tslint:disable-next-line:ter-prefer-arrow-callback
    return knex.schema.createTable('configurations', function (t) {
        t.bigIncrements('id');
        t.string('buid');
        t.string('setup_id');
        t.json('setup');
        t.specificType('scopes', 'text ARRAY');
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTable('configurations');
}
exports.down = down;
