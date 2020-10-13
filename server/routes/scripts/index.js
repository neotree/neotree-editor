import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/scripts';

const router = express.Router();

module.exports = app => {
  router.get(
    endpoints.GET_SCRIPTS,
    require('./getScriptsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_SCRIPT,
    require('./getScriptMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_FULL_SCRIPT,
    require('./getFullScriptMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_SCRIPT_ITEMS,
    require('./getScriptItemsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.CREATE_SCRIPT,
    require('./createScriptMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_SCRIPT,
    require('./updateScriptMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_SCRIPTS,
    require('./updateScriptsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_SCRIPT,
    require('./deleteScriptMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DUPLICATE_SCRIPT,
    require('./duplicateScriptMiddleware').default(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
