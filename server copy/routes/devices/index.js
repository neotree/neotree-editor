import express from 'express';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/register-device',
    require('./createDeviceMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-device',
    require('./getDeviceMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-devices',
    require('./getDevicesMiddleware')(app),
    responseMiddleware
  );

  return router;
};
