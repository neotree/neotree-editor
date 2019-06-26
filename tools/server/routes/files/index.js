import express from 'express';

let router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router = require('./uploadTmpFileMiddleware')(router, app);

  router.use(
    '/delete-tmp-uploads',
    require('./deleteTmpUploadsMiddleware')(app),
    responseMiddleware
  );

  return router;
};
