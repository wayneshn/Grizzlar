"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth1SignatureMethod = exports.EAuthType = exports.ELocalRedirectMethod = exports.EDashboardApiErrorCodes = void 0;
var EDashboardApiErrorCodes;
(function (EDashboardApiErrorCodes) {
    EDashboardApiErrorCodes["ENVIRONMENT_NOT_FOUND"] = "ENVIRONMENT_NOT_FOUND";
    EDashboardApiErrorCodes["INTEGRATION_NOT_FOUND"] = "INTEGRATION_NOT_FOUND";
})(EDashboardApiErrorCodes = exports.EDashboardApiErrorCodes || (exports.EDashboardApiErrorCodes = {}));
var ELocalRedirectMethod;
(function (ELocalRedirectMethod) {
    ELocalRedirectMethod["Inline"] = "inline";
    ELocalRedirectMethod["Localhost"] = "localhost";
})(ELocalRedirectMethod = exports.ELocalRedirectMethod || (exports.ELocalRedirectMethod = {}));
var EAuthType;
(function (EAuthType) {
    EAuthType["NoAuth"] = "NO_AUTH";
    EAuthType["OAuth1"] = "OAUTH1";
    EAuthType["OAuth2"] = "OAUTH2";
})(EAuthType = exports.EAuthType || (exports.EAuthType = {}));
var OAuth1SignatureMethod;
(function (OAuth1SignatureMethod) {
    OAuth1SignatureMethod["HmacSha1"] = "HMAC-SHA1";
    OAuth1SignatureMethod["RsaSha1"] = "RSA-SHA1";
    OAuth1SignatureMethod["PlainText"] = "PLAINTEXT";
})(OAuth1SignatureMethod = exports.OAuth1SignatureMethod || (exports.OAuth1SignatureMethod = {}));
