import express from 'express';

const router = express.Router();

module.exports = app => {
  router.get(
    '/register-device',
    require('./createDeviceMiddleware')(app),
    app.responseMiddleware
  );

  router.get(
    '/get-device',
    require('./getDeviceMiddleware')(app),
    app.responseMiddleware
  );

  router.get(
    '/get-devices',
    require('./getDevicesMiddleware')(app),
    app.responseMiddleware
  );

  return router;
};
