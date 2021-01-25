import express from 'express';

const router = express.Router();

module.exports = app => {
  router.get(
    '/get-scripts',
    require('./getScriptsMiddleware')(app),
    app.responseMiddleware
  );

  router.get(
    '/get-script',
    require('./getScriptMiddleware')(app),
    app.responseMiddleware
  );

  router.get(
    '/get-script-items',
    require('./getScriptItemsMiddleware')(app),
    app.responseMiddleware
  );

  router.post(
    '/create-script',
    require('./createScriptMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/update-script',
    require('./updateScriptMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/update-scripts',
    require('./updateScriptsMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/delete-scripts',
    require('./deleteScriptsMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/duplicate-scripts',
    require('./duplicateScriptsMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  return router;
};
