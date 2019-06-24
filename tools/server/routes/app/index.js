import express from 'express';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/initialise-app',
    require('../users/getAuthenticatedUserMiddleware')(app),
    responseMiddleware
  );

  return router;
};
