"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("./errors");
const utils_1 = require("../../functions/utils");
const respondWithOAuthError = (res, { statusCode, code, message }) => {
    res.header('Content-Type', 'text/html');
    res.status(statusCode);
    res.render('auth/error', { error: `${code}: ${message}` });
};
const respondWithCallbackError = (req, res, err) => {
    res.header('Content-Type', 'text/html');
    res.status(err.statusCode);
    res.render('auth/callback', {
        authId: req.authId,
        error: err.error,
        error_description: err.errorDescription,
        integrationUuid: req.buid
    });
};
const respondWithCallbackPlaceholder = (req, res, { statusCode, code, message }) => {
    res.header('Content-Type', 'text/html');
    res.status(statusCode);
    res.render('auth/placeholder', {
        error: `${code}: ${message}`,
        callbackUrl: req.originalUrl,
        method: req.method
    });
};
exports.errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    if (err.statusCode) {
        if (err instanceof errors_1.AuthenticationFailed) {
            return respondWithCallbackError(req, res, err);
        }
        if (err instanceof errors_1.NoAuthInProgress && utils_1.isEmpty(req.query)) {
            return respondWithCallbackPlaceholder(req, res, err);
        }
        return respondWithOAuthError(res, err);
    }
    respondWithOAuthError(res, {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'Encountered an unexpected error. Please contact support'
    });
};
