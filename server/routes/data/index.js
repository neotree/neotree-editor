import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/data';

const router = express.Router();

module.exports = app => {
  router.get(endpoints.EXPORT_DATA, require('./exportDataMiddleware')(app));

  router.post(
    endpoints.COPY_DATA,
    require('./copyDataMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.SYNC_DATA,
    require('./syncData')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
