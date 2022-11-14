"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedAgentConfigAccess = exports.RateLimitReached = exports.SetupDetailsNotFound = exports.FunctionNotFound = exports.InvalidBuid = exports.MissingParameter = exports.UnhandledFunctionError = exports.GenericFunctionError = exports.UserError = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = new Error(message).stack;
        }
    }
}
exports.CustomError = CustomError;
class UserError extends CustomError {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}
exports.UserError = UserError;
class GenericFunctionError extends UserError {
    constructor(req, e) {
        super(`Error while executing function`, 422, 'FUNCTION_ERROR');
    }
}
exports.GenericFunctionError = GenericFunctionError;
function timeOut(error, payload) {
    const unhandled = error === 'Unhandled';
    const errorMessage = JSON.parse(payload).errorMessage.toString();
    const timedOut = unhandled && /Task timed out/.test(errorMessage);
    return timedOut;
}
class UnhandledFunctionError extends UserError {
    constructor({ FunctionError, Payload }) {
        if (timeOut(FunctionError, Payload)) {
            super(`Integration execution timed out`, 504, 'INTEGRATION_EXECUTION_TIMED_OUT');
        }
        else {
            super(`Error while processing integration: ${Payload} `, 422, 'UNHANDLED_FUNCTION');
        }
    }
}
exports.UnhandledFunctionError = UnhandledFunctionError;
class MissingParameter extends UserError {
    constructor(name) {
        super(`'${name}' must be set`, 400, 'MISSING_PARAMETER');
    }
}
exports.MissingParameter = MissingParameter;
class InvalidBuid extends UserError {
    constructor(buid) {
        super(
        // tslint:disable-next-line:max-line-length
        `No API found with alias/buid '${buid}', please refer to this link for further information: https://docs.bearer.sh/dashboard/apis#how-to-add-a-new-api`, 422, 'INVALID_BUID');
    }
}
exports.InvalidBuid = InvalidBuid;
class FunctionNotFound extends UserError {
    constructor(functionName) {
        super(`Could not find function '${functionName}'. Perhaps url is incorrect?`, 404, 'FUNCTION_NOT_FOUND');
    }
}
exports.FunctionNotFound = FunctionNotFound;
class SetupDetailsNotFound extends UserError {
    constructor({ clientId, buid, setupId }) {
        super(`Setup details not found for clientId '${clientId}', buid '${buid}' and setupId '${setupId}'`, 422, 'SETUP_DETAILS_NOT_FOUND');
    }
}
exports.SetupDetailsNotFound = SetupDetailsNotFound;
class RateLimitReached extends UserError {
    constructor() {
        super(`Your request couldn't be performed because you have reached Bearer's rate limit.
More information on our rate limiting here: https://docs.bearer.sh/rate-limiting`, 429, 'API_RATE_LIMIT_REACHED');
    }
}
exports.RateLimitReached = RateLimitReached;
class UnauthorizedAgentConfigAccess extends UserError {
    constructor() {
        super('Unauthorized invalid secret key', 401, 'UNAUTHORIZED_AGENT_CONFIG_ACCESS');
    }
}
exports.UnauthorizedAgentConfigAccess = UnauthorizedAgentConfigAccess;
