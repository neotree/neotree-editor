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

  router.get(
    '/get-full-config-key',
    require('./getFullConfigKeyMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/create-config-key',
    require('./createConfigKeyMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/update-config-key',
    require('./updateConfigKeyMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/update-config-keys',
    require('./updateConfigKeysMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/delete-config-key',
    require('./deleteConfigKeyMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/duplicate-config-key',
    require('./duplicateConfigKeyMiddleware').default(app),
    responseMiddleware
  );

  return router;
};
