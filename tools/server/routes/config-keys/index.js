import express from 'express';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/get-config-keys',
    require('./getConfigKeysMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-config-key',
    require('./getConfigKeyMiddleware')(app),
    responseMiddleware
  );

  return router;
};
