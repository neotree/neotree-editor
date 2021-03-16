import express from 'express';
import apiKeyAuthenticator from './apiKeyAuthenticator';

const router = express.Router();

module.exports = app => {
  router.get(
    '/key',
    require('./getApiKeyMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/download-api-config',
    require('./downloadApiConfigFileMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.post(
    '/generate-key',
    require('./generateApiKeyMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-config-keys',
    apiKeyAuthenticator(app),
    require('./getConfigKeysMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-config-key',
    apiKeyAuthenticator(app),
    require('./getConfigKeyMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-hospitals',
    apiKeyAuthenticator(app),
    require('./getHospitalsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-scripts',
    apiKeyAuthenticator(app),
    require('./getScriptsMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-script',
    apiKeyAuthenticator(app),
    require('./getScriptMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-screens',
    apiKeyAuthenticator(app),
    require('./getScreensMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-screen',
    apiKeyAuthenticator(app),
    require('./getScreenMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-diagnoses',
    apiKeyAuthenticator(app),
    require('./getDiagnosesMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-diagnosis',
    apiKeyAuthenticator(app),
    require('./getDiagnosisMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/sync-data',
    apiKeyAuthenticator(app),
    require('../data/syncData')(app),
    require('../../utils/responseMiddleware')
  );

  router.get(
    '/get-device-registration',
    apiKeyAuthenticator(app),
    require('../devices/getDeviceMiddleware')(app),
    require('../../utils/responseMiddleware')
  );

  return router;
};
