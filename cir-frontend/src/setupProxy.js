const { createProxyMiddleware } = require('http-proxy-middleware');
const { SERVER_IP } = require('./constants');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `${SERVER_IP}`,
      changeOrigin: true,
    })
  );
};
