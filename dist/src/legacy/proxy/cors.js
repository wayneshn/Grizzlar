"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cors = exports.proxyCorsMiddleware = void 0;
const allowedProxyMethods = 'OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE';
exports.proxyCorsMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', allowedProxyMethods);
        res.header('Access-Control-Allow-Headers', req.get('Access-Control-Request-Headers'));
        return res.sendStatus(204);
    }
    next();
};
exports.cors = (req, res, next) => {
    // This is a temporary measure. Eventually, we need to separate out the proxy
    // routing from the rest of the app so we can use the proxy middleware on it's own
    if (req.originalUrl.includes('bearer-proxy')) {
        return exports.proxyCorsMiddleware(req, res, next);
    }
    res.header('Access-Control-Allow-Origin', req.get('origin') || '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, User-Agent, Authorization, Bearer-Publishable-Key');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Credentials', 'true');
    if ('OPTIONS' === req.method) {
        res.send(204);
    }
    else {
        res.header('Content-Type', 'application/json');
        next();
    }
};
