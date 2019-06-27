import express from 'express';

let router = express.Router();

module.exports = app => {
  // const { responseMiddleware } = app;

  router = require('./uploadFileMiddleware')(router, app);

  return router;
};
