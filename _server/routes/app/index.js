import express from 'express';

let router = express.Router();

module.exports = app => {
  // const { responseMiddleware } = app;

  router = require('./importFromFirebaseMiddleware')(router, app);

  router.get(
    '/initialise-app',
    require('./getAppMiddleware')(app),
    require('../users/getAuthenticatedUserMiddleware')(app),
    (req, res) => {
      const { app, ...payload } = res.locals.getResponsePayload() || {};
      res.json({
        error: res.locals.getResponseError(),
        payload: { ...payload, ...app }
      });
    }
  );

  return router;
};