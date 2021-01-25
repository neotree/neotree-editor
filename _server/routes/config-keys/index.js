import express from 'express';

const router = express.Router();

module.exports = app => {
  router.get(
    '/get-config-keys',
    require('./getConfigKeysMiddleware')(app),
    app.responseMiddleware
  );

  router.get(
    '/get-config-key',
    require('./getConfigKeyMiddleware')(app),
    app.responseMiddleware
  );

  router.post(
    '/create-config-key',
    require('./createConfigKeyMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/update-config-key',
    require('./updateConfigKeyMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/update-config-keys',
    require('./updateConfigKeysMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/delete-config-keys',
    require('./deleteConfigKeysMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/duplicate-config-keys',
    require('./duplicateConfigKeysMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  return router;
};
