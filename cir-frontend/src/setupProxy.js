const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8009',
      changeOrigin: true,
    })
  );

  // Proxy Martin tile server through the dev server so tile URLs are same-origin.
  // Desktop (localhost:3002) and mobile (LAN IP:3002) both resolve tiles correctly
  // without any hostname detection in the frontend code.
  app.use(
    '/martin-tiles',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: { '^/martin-tiles': '' },
    })
  );
};
