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

  router.get(
    '/get-full-script',
    require('./getFullScriptMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-script-items',
    require('./getScriptItemsMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/create-script',
    require('./createScriptMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/update-script',
    require('./updateScriptMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/update-scripts',
    require('./updateScriptsMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/delete-script',
    require('./deleteScriptMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/duplicate-script',
    require('./duplicateScriptMiddleware').default(app),
    responseMiddleware
  );

  return router;
};
