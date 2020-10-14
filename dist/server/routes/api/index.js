"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _apiKeyAuthenticator = _interopRequireDefault(require("./apiKeyAuthenticator"));

var router = _express["default"].Router();

module.exports = function (app) {
  router.get('/key', require('./getApiKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/download-api-config', require('./downloadApiConfigFileMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post('/generate-key', require('./generateApiKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-config-keys', (0, _apiKeyAuthenticator["default"])(app), require('./getConfigKeysMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-config-key', (0, _apiKeyAuthenticator["default"])(app), require('./getConfigKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-scripts', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptsMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-script', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-screens', (0, _apiKeyAuthenticator["default"])(app), require('./getScreensMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-screen', (0, _apiKeyAuthenticator["default"])(app), require('./getScreenMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-diagnoses', (0, _apiKeyAuthenticator["default"])(app), require('./getDiagnosesMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-diagnosis', (0, _apiKeyAuthenticator["default"])(app), require('./getDiagnosisMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/sync-data', (0, _apiKeyAuthenticator["default"])(app), require('../data/syncData')(app), require('../../utils/responseMiddleware'));
  router.post('/register-device', (0, _apiKeyAuthenticator["default"])(app), require('../devices/createDeviceMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-device', (0, _apiKeyAuthenticator["default"])(app), require('../devices/getDeviceMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-devices', (0, _apiKeyAuthenticator["default"])(app), require('../devices/getDevicesMiddleware')(app), require('../../utils/responseMiddleware'));
  return router;
};