"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncErrorMiddleware = exports.asyncMiddleware = void 0;
exports.asyncMiddleware = (fn) => function asyncUtilWrap(req, res, next) {
    const fnReturn = fn(req, res, next);
    return Promise.resolve(fnReturn).catch(next);
};
exports.asyncErrorMiddleware = (fn) => function asyncUtilWrap(err, req, res, next) {
    const fnReturn = fn(err, req, res, next);
    return Promise.resolve(fnReturn).catch(next);
};
const errorHandler = exports.asyncErrorMiddleware(async (err, req, res, next) => {
    if (err.statusCode) {
        if (!res.headersSent) {
            return res.status(err.statusCode).json({
                error: {
                    code: err.code,
                    message: err.message
                }
            });
        }
    }
    next(err);
});
exports.default = errorHandler;
