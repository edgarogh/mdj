const { createProxyMiddleware } = require("http-proxy-middleware");

const loginPostFilter = function (pathname, req) {
    return pathname.match('/login') && req.method === 'POST';
};

module.exports = function (app) {
    app.use(createProxyMiddleware("/api", {
        "target": "http://localhost:8000/"
    }));
    app.use(createProxyMiddleware(loginPostFilter, {
        "target": "http://localhost:8000/"
    }));
    app.use(createProxyMiddleware("/logout", {
        "target": "http://localhost:8000/"
    }));
};
