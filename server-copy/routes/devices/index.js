import express from 'express';

const router = express.Router();

module.exports = app => {
  router.get(
    '/register-device',
    require('./createDeviceMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-device',
    require('./getDeviceMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-devices',
    require('./getDevicesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
