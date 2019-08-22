import express from 'express';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/my-ui',
    require('./getMyUIMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/update-my-ui',
    require('./updateMyUIMiddleware')(app),
    responseMiddleware
  );

  return router;
};
