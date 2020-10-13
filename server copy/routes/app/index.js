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
    '/initialise-data',
    require('../auth/getAuthenticatedUserMiddleware')(app),
    responseMiddleware,
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
    '/sync-data',
    require('./syncData')(app),
    responseMiddleware
  );

  return router;
};
