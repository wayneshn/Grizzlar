"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomingRequestHandler = void 0;
const https_1 = __importDefault(require("https"));
const url_1 = require("url");
const database_1 = require("../database");
const interpolation_1 = require("./interpolation");
const oauth_1 = require("../oauth");
const error_handling_1 = require("../error-handling");
const integrations_1 = require("../database/integrations");
const configurations_1 = require("../database/configurations");
const request_config_1 = require("../../legacy/api-config/request-config");
/**
 * Handle the request sent to Pizzly from the developer's application
 * and forward it to the third party API.
 *
 * @param req
 * @param res
 * @param next
 */
exports.incomingRequestHandler = async (req, res, next) => {
    // General inputs validation
    const authId = req.get('Pizzly-Auth-Id') || '';
    const integrationName = req.params.integration;
    if (!authId) {
        return next(new error_handling_1.PizzlyError('missing_auth_id'));
    }
    // Retrieve integration & authentication details
    const integration = await database_1.integrations.get(integrationName);
    if (!integration) {
        return next(new Error('unknown_integration'));
    }
    let authentication = (authId && (await database_1.authentications.get(integrationName, authId))) || undefined;
    if (!authentication) {
        return next(new error_handling_1.PizzlyError('unknown_authentication'));
    }
    try {
        // Handle the token freshness (if it has expired)
        if (await oauth_1.accessTokenHasExpired(authentication)) {
            authentication = await oauth_1.refreshAuthentication(integration, authentication);
        }
        if (!authentication) {
            return next(new error_handling_1.PizzlyError('token_refresh_failed')); // TODO: improve error verbosity
        }
        // Replace request options with provided authentication or data
        // i.e. replace ${auth.accessToken} from the integration template
        // with the authentication access token retrieved from the database.
        const forwardedHeaders = headersToForward(req.rawHeaders);
        const { url, headers } = await buildRequest({
            authentication,
            integration,
            method: req.method,
            forwardedHeaders: forwardedHeaders,
            path: req.originalUrl.substring(('/proxy/' + integrationName).length + 1)
        });
        // Remove pizzly related params: ex
        url.searchParams.forEach((value, key) => {
            if (key.startsWith('pizzly_')) {
                url.searchParams.delete(key);
            }
        });
        // Perform external request
        const externalRequest = https_1.default.request(url, { headers, method: req.method }, externalResponse => {
            externalResponseHandler(externalResponse, req, res, next);
        });
        req.pipe(externalRequest);
        // Handle error
        externalRequest.on('error', error => {
            throw error;
        });
    }
    catch (err) {
        next(err);
    }
};
/**
 * Handle the response from the third party API
 * and send it back to the developer's application.
 *
 * @param externalResponse
 * @param req
 * @param res
 * @param next
 */
const externalResponseHandler = (externalResponse, _req, res, _next) => {
    // Set headers
    res.writeHead(externalResponse.statusCode, externalResponse.headers);
    externalResponse.pipe(res);
};
/**
 * Helper to determine which headers to forward.
 *
 * The proxy feature forwards all headers starting with "Pizzly-Proxy-" (case insensitive)
 * to the third-party API.
 *
 * @params headers (string[]) - The original request headers
 * @return (object) - The headers to forward
 */
const HEADER_PROXY = 'pizzly-proxy-';
const headersToForward = (headers) => {
    const forwardedHeaders = {};
    for (let i = 0, n = headers.length; i < n; i += 2) {
        const headerKey = headers[i].toLowerCase();
        if (headerKey.startsWith(HEADER_PROXY)) {
            forwardedHeaders[headerKey.slice(HEADER_PROXY.length)] = headers[i + 1] || '';
        }
    }
    return forwardedHeaders;
};
async function buildRequest({ integration, path, authentication, forwardedHeaders, method }) {
    const { request: requestConfig } = integration;
    try {
        // First interpolation phase with utility headers (prefixed with Pizzly)
        let auth = { ...authentication.payload };
        // edge case: we need consumerKey an consumerSecret availability within templates
        if (integrations_1.isOAuth1(integration)) {
            //
            const config = await configurations_1.getConfiguration(integration.id, authentication.setup_id);
            if (config) {
                const configDetails = config.credentials;
                const callbackParams = auth.callbackParamsJSON ? JSON.parse(auth.callbackParamsJSON) : undefined;
                const oauth1 = request_config_1.getOAuth1Credentials({
                    baseURL: requestConfig.baseURL,
                    method,
                    path,
                    auth: {
                        callbackParams,
                        ...integration.auth,
                        ...auth,
                        ...configDetails
                    }
                });
                auth = {
                    oauth1,
                    ...auth,
                    consumerKey: configDetails.consumerKey
                };
            }
        }
        const interpolatedHeaders = interpolation_1.interpolate({ ...(requestConfig.headers || {}), ...forwardedHeaders }, '', {
            auth
        });
        // redefine interpolate with interpolated headers
        const localInterpolate = (template) => interpolation_1.interpolate(template, '', { auth: auth, headers: interpolatedHeaders });
        // Second interpolation with interpolated headers
        const url = new url_1.URL(localInterpolate(path), localInterpolate(requestConfig.baseURL));
        const interpolatedParams = localInterpolate(requestConfig.params || {});
        for (let param in interpolatedParams) {
            url.searchParams.append(param, interpolatedParams[param]);
        }
        return {
            url,
            headers: interpolatedHeaders
        };
    }
    catch (e) {
        // handle incorrect interpolation
        throw e;
    }
}
