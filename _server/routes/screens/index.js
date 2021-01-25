import express from 'express';

const router = express.Router();

module.exports = app => {
  router.get(
    '/get-screens',
    require('./getScreensMiddleware')(app),
    app.responseMiddleware
  );

  router.get(
    '/get-screen',
    require('./getScreenMiddleware')(app),
    app.responseMiddleware
  );

  router.post(
    '/create-screen',
    require('./createScreenMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/update-screen',
    require('./updateScreenMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/update-screens',
    require('./updateScreensMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/delete-screens',
    require('./deleteScreensMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/duplicate-screens',
    require('./duplicateScreensMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  router.post(
    '/copy-screens',
    require('./copyScreensMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    app.responseMiddleware
  );

  return router;
};
