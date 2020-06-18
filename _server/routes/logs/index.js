import express from 'express';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/get-logs',
    require('./getLogsMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-log',
    require('./getLogMiddleware')(app),
    responseMiddleware
  );

  return router;
};
