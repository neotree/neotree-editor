import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/screens';

const router = express.Router();

module.exports = app => {
  router.get(
    endpoints.GET_SCREENS,
    require('./getScreensMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_SCREEN,
    require('./getScreenMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.CREATE_SCREEN,
    require('./createScreenMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_SCREEN,
    require('./updateScreenMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_SCREENS,
    require('./updateScreensMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_SCREENS,
    require('./deleteScreensMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DUPLICATE_SCREENS,
    require('./duplicateScreensMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.COPY_SCREENS,
    require('./copyScreensMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
