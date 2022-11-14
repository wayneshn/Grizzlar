"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishableKey = exports.secretKey = exports.basic = void 0;
const error_handling_1 = require("../error-handling");
/**
 * Basic Access Authentication Middleware
 * @see https://tools.ietf.org/html/rfc7617
 */
const basic = (req, res, next) => {
    const credentials = {
        user: process.env.DASHBOARD_USERNAME || process.env.DASHBOARD_USER,
        password: process.env.DASHBOARD_PASSWORD
    };
    if (!credentials.user && !credentials.password) {
        next();
        return;
    }
    const authorizationHeader = req.get('authorization');
    if (!authorizationHeader) {
        res.status(401);
        res.setHeader('WWW-Authenticate', 'Basic');
        res.render('errors/401');
        return;
    }
    const { providedUser, providedPassword } = fromBasicAuth(authorizationHeader);
    if (providedUser !== credentials.user || providedPassword !== credentials.password) {
        res.status(401);
        res.setHeader('WWW-Authenticate', 'Basic');
        res.render('errors/401');
        return;
    }
    next();
};
exports.basic = basic;
/**
 * Secret Key Access Authentication
 *
 * It uses the BASIC authentication schema
 * where only the username is provided and
 * must match the developer's SECRET_KEY.
 *
 * To change your SECRET_KEY have a look to
 * the .envrc file.
 */
const secretKey = (req, res, next) => {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
        next();
        return;
    }
    const authorizationHeader = req.get('authorization');
    if (!authorizationHeader) {
        throw new error_handling_1.PizzlyError('missing_secret_key');
    }
    const { providedUser } = fromBasicAuth(authorizationHeader);
    if (providedUser !== secretKey) {
        throw new error_handling_1.PizzlyError('invalid_secret_key');
    }
    next();
};
exports.secretKey = secretKey;
/**
 * Publishable Key Access Authentication
 *
 * It requires a `?pizzly_pkey=....` in the request
 * query params. Such query params is remove on the
 * proxy feature (like all query params starting with
 * "pizzly_").
 *
 * To change your PUBLISHABLE_KEY have a look to
 * the .envrc file.
 */
const publishableKey = (req, res, next) => {
    const publishableKey = process.env.PUBLISHABLE_KEY;
    if (!publishableKey) {
        next();
        return;
    }
    const providedPublishableKey = req.query['pizzly_pkey'];
    if (typeof providedPublishableKey !== 'string') {
        throw new error_handling_1.PizzlyError('missing_publishable_key');
    }
    if (providedPublishableKey !== publishableKey) {
        throw new error_handling_1.PizzlyError('invalid_publishable_key');
    }
    next();
};
exports.publishableKey = publishableKey;
/**
 * Helper to explode a basic authorization header
 *
 * @param authorizationHeader (string) - The full authorization header
 * @returns Object
 *  - providedUser (string) - The provided user
 *  - providedPassword (string) - The provided password
 */
const fromBasicAuth = (authorizationHeader) => {
    const basicAsBase64 = authorizationHeader.split('Basic ').pop() || '';
    const basicAsBuffer = Buffer.from(basicAsBase64, 'base64');
    const basicAsString = basicAsBuffer.toString('utf-8');
    const providedCredentials = basicAsString.split(':');
    const providedUser = providedCredentials.shift() || '';
    const providedPassword = providedCredentials.shift() || '';
    return { providedUser, providedPassword };
};
