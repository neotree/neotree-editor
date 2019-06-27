import express from 'express';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/get-screens',
    require('./getScreensMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-screen',
    require('./getScreenMiddleware')(app),
    responseMiddleware
  );

  return router;
};
