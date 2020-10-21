import express from 'express';
import importFirebase from '../../database/firebase/import';
import * as endpoints from '../../../constants/api-endpoints/data';

const router = express.Router();

module.exports = app => {
  router.post(endpoints.IMPORT_FIREBASE, (req, res, next) => {
    const done = (err, data) => {
      res.locals.setResponse(err, data);
      next();
    };

    importFirebase()
      .then(() => done(null, { success: true }))
      .catch(done);
  }, require('../../utils/responseMiddleware'));

  router.get(endpoints.EXPORT_DATA, require('./exportDataMiddleware')(app));

  router.post(
    endpoints.COPY_DATA,
    require('./copyDataMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
   endpoints.EXPORT_TO_FIREBASE,
    require('./exportToFirebaseMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.SYNC_DATA,
    require('./syncData')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
