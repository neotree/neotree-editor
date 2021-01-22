import express from 'express';
import * as endpoints from '../../../constants/api-endpoints/configKeys';

const router = express.Router();

module.exports = app => {
  router.get(
    endpoints.GET_CONFIG_KEYS,
    require('./getConfigKeysMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    endpoints.GET_CONFIG_KEY,
    require('./getConfigKeyMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.CREATE_CONFIG_KEY,
    require('./createConfigKeyMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_CONFIG_KEY,
    require('./updateConfigKeyMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.UPDATE_CONFIG_KEYS,
    require('./updateConfigKeysMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DELETE_CONFIG_KEYS,
    require('./deleteConfigKeysMiddleware')(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  router.post(
    endpoints.DUPLICATE_CONFIG_KEYS,
    require('./duplicateConfigKeysMiddleware').default(app),
    (req, res, next) => {
      app.io.emit('data_updated');
      next();
    },
    require('../../utils/responseMiddleware')
  );

  return router;
};
