import express from 'express';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/get-screens',
    require('./getScreensMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-screen',
    require('./getScreenMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-full-screen',
    require('./getFullScreenMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/create-screen',
    require('./createScreenMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/update-screen',
    require('./updateScreenMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/update-screens',
    require('./updateScreensMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/delete-screen',
    require('./deleteScreenMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/duplicate-screen',
    require('./duplicateScreenMiddleware').default(app),
    responseMiddleware
  );

  return router;
};
