import express from 'express';

let router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router = require('./importDataMiddleware')(router, app);

  router.get(
    '/initialise-app',
    require('./initialiseAppMiddleware')(app),
    (req, res) => {
      const { app, ...payload } = res.locals.getResponsePayload() || {};
      res.json({
        error: res.locals.getResponseError(),
        payload: { ...payload, ...app }
      });
    }
  );

  router.get('/export-data', require('./exportDataMiddleware')(app));

  router.post(
    '/copy-data',
    require('./copyDataMiddleware')(app),
    responseMiddleware
  );

  return router;
};
