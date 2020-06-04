import express from 'express';
import apiKeyAuthenticator from './apiKeyAuthenticator';

const router = express.Router();

module.exports = app => {
  const { responseMiddleware } = app;

  router.get(
    '/key',
    require('./getApiKeyMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/download-api-config',
    require('./downloadApiConfigFileMiddleware')(app),
    responseMiddleware
  );

  router.post(
    '/generate-key',
    require('./generateApiKeyMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-scripts',
    apiKeyAuthenticator(app),
    require('./getScriptsMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-script',
    apiKeyAuthenticator(app),
    require('./getScriptMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-screens',
    apiKeyAuthenticator(app),
    require('./getScreensMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-screens',
    apiKeyAuthenticator(app),
    require('./getScreensMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-data-activity-info',
    apiKeyAuthenticator(app),
    require('../app/getDataActivityInfo')(app),
    responseMiddleware
  );

  return router;
};
