import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/screens';

const router = express.Router();

module.exports = app => {
  router.post(
    endpoints.COPY_SCREENS,
    require('./copyScreensMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

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

  router.get(
    endpoints.GET_FULL_SCREEN,
    require('./getFullScreenMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    '/create-screen',
    require('./createScreenMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_SCREEN,
    require('./updateScreenMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_SCREENS,
    require('./updateScreensMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_SCREEN,
    require('./deleteScreenMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DUPLICATE_SCREEN,
    require('./duplicateScreenMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
