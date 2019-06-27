import express from 'express';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/get-scripts',
    require('./getScriptsMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-script',
    require('./getScriptMiddleware')(app),
    responseMiddleware
  );

  return router;
};
