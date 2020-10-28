import express from 'express';

const router = express.Router();

module.exports = app => {
  router.get('/export-data', require('./exportDataMiddleware')(app));

  router.post(
    '/import-firebase',
    require('./copyDataMiddleware')(app),
    app.responseMiddleware
  );

  router.post(
    '/export-to-firebase',
    require('./exportToFirebaseMiddleware')(app),
    app.responseMiddleware
  );

  router.get(
    '/sync-data',
    require('./syncData')(app),
    app.responseMiddleware
  );

  return router;
};
