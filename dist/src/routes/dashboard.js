"use strict";
/**
 * Dashboard routes
 *
 * Pizzly's dashboard helps you manage the project using a browser.
 * Whilst most methods are available through the API, we felt it's more convenient
 * and it reduces the learning curve to use the project through a browser.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = void 0;
const express = __importStar(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const integrations = __importStar(require("../lib/database/integrations"));
const database_1 = require("../lib/database");
const access = __importStar(require("../lib/access"));
const error_handling_1 = require("../lib/error-handling");
const dashboard = express.Router();
exports.dashboard = dashboard;
dashboard.use(body_parser_1.default.urlencoded({ extended: false }));
dashboard.use(body_parser_1.default.json({ limit: '5mb' }));
/**
 * Authentication middleware.
 *
 * Authenticate requests to the dashboard using a BASIC authentication.
 * This requires that you've previously secured your Pizzly's instance.
 * Learn more at https://github.com/Bearer/Pizzly/wiki/Secure
 */
dashboard.use('*', access.basic);
/**
 * General middleware to surchage the request variable with some EJS properties.
 * This ease how we render files by the EJS template engine.
 */
dashboard.use('/', (req, res, next) => {
    // @ts-ignore
    req.ejs = {
        datetimeOptions: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        },
        dateOptions: {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    };
    return next();
});
/**
 * Dashboard's homepage
 *
 * @render the list of enabled APIs
 */
dashboard.get('/', async (req, res) => {
    const list = await integrations.list();
    const configurations = await database_1.store('configurations')
        .select('buid')
        .groupBy('buid');
    const enabled = list.filter(integration => {
        for (let i = 0; i < configurations.length; i++) {
            if (configurations[i].buid === integration.id) {
                return true;
            }
        }
        return false;
    });
    // @ts-ignore
    req.data = { ...req.data, enabled };
    res.render('dashboard/home', { req });
});
/**
 * All APIs page
 *
 * @render the list of all APIs available in the "/integrations" directory
 */
dashboard.get('/all', async (req, res) => {
    const list = await integrations.list();
    // @ts-ignore
    req.data = { ...req.data, integrations: list };
    res.render('dashboard/home-all', { req });
});
/**
 * Dashboard settings page
 */
dashboard.get('/settings', async (req, res) => {
    const keys = [
        { name: 'DASHBOARD_USERNAME', value: process.env.DASHBOARD_USERNAME, services: ['Dashboard'] },
        { name: 'DASHBOARD_PASSWORD', value: process.env.DASHBOARD_PASSWORD, services: ['Dashboard'] },
        { name: 'SECRET_KEY', value: process.env.SECRET_KEY, services: ['API', 'Proxy'] },
        { name: 'PUBLISHABLE_KEY', value: process.env.PUBLISHABLE_KEY, services: ['Auth', 'Proxy'] },
        { name: 'BEARER_SECRET_KEY', value: process.env.BEARER_SECRET_KEY, services: ['Auth', 'Proxy'] }
    ];
    // @ts-ignore
    req.data = { ...req.data, keys };
    res.render('dashboard/settings-keys', { req });
});
/**
 * Integration middleware
 */
dashboard.use('/:integration', async (req, res, next) => {
    try {
        const integration = await integrations.get(req.params.integration);
        // @ts-ignore
        req.ejs = { ...req.ejs, base_url: `/dashboard/${req.params.integration}` };
        // @ts-ignore
        req.data = { ...req.data, integration };
        return next();
    }
    catch (err) {
        next(new error_handling_1.PizzlyError('unknown_integration'));
    }
});
/**
 * Integration's overview
 */
dashboard.get('/:integration', async (req, res) => {
    const integration = String(req.params.integration);
    const savedConfigs = await database_1.store('configurations')
        .select('credentials', 'setup_id', 'scopes', 'created_at')
        .where({ buid: integration })
        .orderBy('created_at', 'desc')
        .limit(5)
        .offset(0);
    const configurations = [];
    savedConfigs.forEach(item => {
        configurations.push(formatConfiguration(item));
    });
    const authentications = await database_1.store('authentications')
        .select('auth_id', 'setup_id', 'created_at', 'updated_at')
        .where({ buid: integration })
        .orderBy('updated_at', 'desc')
        .limit(5)
        .offset(0);
    // @ts-ignore
    req.data = { ...req.data, configurations, authentications };
    res.render('dashboard/api', { req });
});
/**
 * Integration > Configurations
 */
/**
 * List all the configurations saved
 */
dashboard.get('/:integration/configurations', async (req, res) => {
    const startAt = Number(req.query.startAt) || 0;
    const savedConfigs = await database_1.store('configurations')
        .select('credentials', 'setup_id', 'scopes', 'created_at')
        .where({ buid: req.params.integration })
        .orderBy('updated_at', 'desc')
        .limit(25)
        .offset(startAt > 0 ? startAt : 0);
    const configurations = [];
    savedConfigs.forEach(item => {
        configurations.push(formatConfiguration(item));
    });
    // @ts-ignore
    req.data = { ...req.data, configurations };
    res.render('dashboard/api-configurations', { req });
});
/**
 * New configuration form (GET)
 */
dashboard.get('/:integration/configurations/new', (req, res) => {
    res.render('dashboard/api-configurations-new', { req });
});
/**
 * New configuration form handler (POST)
 */
dashboard.post('/:integration/configurations/new', async (req, res) => {
    const scopes = integrations.validateConfigurationScopes(String(req.body.scopes));
    // @ts-ignore
    const integration = req.data.integration;
    const newCredentials = formatSetup(String(req.body.setupKey), String(req.body.setupSecret), integration);
    const credentials = integrations.validateConfigurationCredentials(newCredentials, integration);
    const setup_id = uuid_1.v4();
    await database_1.store('configurations').insert({
        buid: req.params.integration,
        setup_id,
        credentials,
        scopes
    });
    // @ts-ignore
    res.redirect(302, `${req.ejs.base_url}`);
});
/**
 * Update configuration form
 */
dashboard.get('/:integration/configurations/:setupId', async (req, res, next) => {
    const setupId = String(req.params.setupId);
    const configuration = await database_1.store('configurations')
        .select('credentials', 'setup_id', 'scopes', 'created_at')
        .where({ buid: req.params.integration, setup_id: setupId })
        .first();
    if (!configuration) {
        next(); // 404 not found
        return;
    }
    // @ts-ignore
    req.data = { ...req.data, configuration: formatConfiguration(configuration) };
    res.render('dashboard/api-configurations-edit', { req });
});
/**
 * Update configuration form handler (POST)
 */
dashboard.post('/:integration/configurations/:setupId', async (req, res) => {
    const setupId = String(req.params.setupId);
    // @ts-ignore
    const integration = req.data.integration;
    const newCredentials = formatSetup(String(req.body.setupKey), String(req.body.setupSecret), integration);
    const credentials = integrations.validateConfigurationCredentials(newCredentials, integration);
    const scopes = integrations.validateConfigurationScopes(String(req.body.scopes));
    await database_1.store('configurations')
        .update({
        setup_id: setupId,
        credentials,
        scopes
    })
        .where({ buid: req.params.integration, setup_id: setupId });
    // @ts-ignore
    res.redirect(302, `${req.ejs.base_url}`);
});
/**
 * Delete a configuration from the dashboard (little trash icon)
 */
dashboard.delete('/:integration/configurations/:setupId', async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl.replace('/dashboard/', '/api/');
    const credentials = Buffer.from(`${process.env.SECRET_KEY}:`, 'utf8').toString('base64');
    await axios_1.default
        .delete(url, { headers: { Authorization: `Basic ${credentials}` } })
        .then(({ data }) => res.json(data))
        .catch(next);
});
/**
 * Integration > Authentications
 */
/**
 * List all the authentications generated
 */
dashboard.get('/:integration/authentications', async (req, res) => {
    const startAt = Number(req.query.startAt) || 0;
    const authentications = await database_1.store('authentications')
        .select('auth_id', 'setup_id', 'created_at', 'updated_at')
        .where({ buid: req.params.integration })
        .orderBy('updated_at', 'desc')
        .limit(25)
        .offset(startAt > 0 ? startAt : 0);
    // @ts-ignore
    req.data = { ...req.data, authentications };
    res.render('dashboard/api-authentications', { req });
});
/**
 * Connect generation to the integration
 */
dashboard.get('/:integration/authentications/connect', (req, res) => {
    res.render('dashboard/api-authentications-connect', { req });
});
/**
 * Render information about a specific authentication (authId)
 */
dashboard.get('/:integration/authentications/:authId', async (req, res) => {
    const authId = String(req.params.authId);
    const authentication = await database_1.store('authentications')
        .select('auth_id', 'payload', 'created_at', 'updated_at')
        .where({ buid: req.params.integration, auth_id: authId })
        .first();
    // @ts-ignore
    req.data = { ...req.data, authentication };
    res.render('dashboard/api-authentications-item', { req });
});
/**
 * Delete an authentication from the dashboard (little trash icon)
 */
dashboard.delete('/:integration/authentications/:setupId', async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl.replace('/dashboard/', '/api/');
    const credentials = Buffer.from(`${process.env.SECRET_KEY}:`, 'utf8').toString('base64');
    await axios_1.default
        .delete(url, { headers: { Authorization: `Basic ${credentials}` } })
        .then(({ data }) => res.json(data))
        .catch(next);
});
/**
 * Integration > Request
 */
dashboard.get('/:integration/request', (req, res) => {
    res.render('dashboard/api-request', { req });
});
/**
 * Helpers
 */
const formatConfiguration = (data) => {
    return {
        setupId: data.setup_id,
        setupKey: data.credentials.clientId || data.credentials.consumerKey,
        setupSecret: data.credentials.clientSecret || data.credentials.consumerSecret,
        scopes: data.scopes || [],
        created_at: new Date(data.created_at)
    };
};
const formatSetup = (setupKey, setupSecret, integration) => {
    if (integrations.isOAuth1(integration)) {
        return { consumerKey: setupKey, consumerSecret: setupSecret };
    }
    else if (integrations.isOAuth2(integration)) {
        return { clientId: setupKey, clientSecret: setupSecret };
    }
    return;
};
