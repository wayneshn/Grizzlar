"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
// Database connection
exports.connection = process.env.DATABASE_URL || {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE || 'pizzly'
};
