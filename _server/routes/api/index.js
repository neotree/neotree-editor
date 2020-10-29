import express from 'express';
import apiKeyAuthenticator from './apiKeyAuthenticator';
import responseMiddleware from './responseMiddleware';

const router = express.Router();

module.exports = app => {
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
    '/get-config-keys',
    apiKeyAuthenticator(app),
    require('./getConfigKeysMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-config-key',
    apiKeyAuthenticator(app),
    require('./getConfigKeyMiddleware')(app),
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
    '/get-screen',
    apiKeyAuthenticator(app),
    require('./getScreenMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-diagnoses',
    apiKeyAuthenticator(app),
    require('./getDiagnosesMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/get-diagnosis',
    apiKeyAuthenticator(app),
    require('./getDiagnosisMiddleware')(app),
    responseMiddleware
  );

  router.get(
    '/sync-data',
    apiKeyAuthenticator(app),
    require('../data/syncData')(app),
    responseMiddleware
  );

  router.get(
    '/get-device-registration',
    apiKeyAuthenticator(app),
    require('../devices/getDeviceMiddleware')(app),
    responseMiddleware
  );

  return router;
};
