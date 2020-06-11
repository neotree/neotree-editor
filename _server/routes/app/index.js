import express from 'express';
import importFirebase from '../../firebase/import';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.post('/import-firebase', (req, res, next) => {
    const done = (err, data) => {
      res.locals.setResponse(err, data);
      next();
    };

    importFirebase()
      .then(() => done(null, { success: true }))
      .catch(done);
  }, responseMiddleware);

  router.get(
    '/initialise-app',
    require('./initialiseAppMiddleware')(app),
    (req, res) => {
      const { app, ...payload } = res.locals.getResponsePayload() || {};
      res.json({
        error: res.locals.getResponseError(),
        payload: { ...payload, ...app }
      });
    }
  );

  router.get('/export-data', require('./exportDataMiddleware')(app));

  router.post(
    '/copy-data',
    require('./copyDataMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/export-to-firebase',
    require('./exportToFirebaseMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-data-activity-info',
    require('./getDataActivityInfo')(app),
    responseMiddleware
  );

  return router;
};
