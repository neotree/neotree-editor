import express from 'express';

let router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router = require('./importFromFirebaseMiddleware')(router, app);

  router.get(
    '/initialise-app',
    require('../users/getAuthenticatedUserMiddleware')(app),
    responseMiddleware
  );

  return router;
};
