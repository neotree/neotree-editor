"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _apiKeyAuthenticator = _interopRequireDefault(require("./apiKeyAuthenticator"));

var router = _express["default"].Router();

module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router.get('/key', require('./getApiKeyMiddleware')(app), responseMiddleware);
  router.get('/download-api-config', require('./downloadApiConfigFileMiddleware')(app), responseMiddleware);
  router.post('/generate-key', require('./generateApiKeyMiddleware')(app), responseMiddleware);
  router.get('/get-config-keys', (0, _apiKeyAuthenticator["default"])(app), require('./getConfigKeysMiddleware')(app), responseMiddleware);
  router.get('/get-config-key', (0, _apiKeyAuthenticator["default"])(app), require('./getConfigKeyMiddleware')(app), responseMiddleware);
  router.get('/get-scripts', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptsMiddleware')(app), responseMiddleware);
  router.get('/get-script', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptMiddleware')(app), responseMiddleware);
  router.get('/get-screens', (0, _apiKeyAuthenticator["default"])(app), require('./getScreensMiddleware')(app), responseMiddleware);
  router.get('/get-screen', (0, _apiKeyAuthenticator["default"])(app), require('./getScreenMiddleware')(app), responseMiddleware);
  router.get('/get-diagnoses', (0, _apiKeyAuthenticator["default"])(app), require('./getDiagnosesMiddleware')(app), responseMiddleware);
  router.get('/get-diagnosis', (0, _apiKeyAuthenticator["default"])(app), require('./getDiagnosisMiddleware')(app), responseMiddleware);
  router.get('/sync-data', (0, _apiKeyAuthenticator["default"])(app), require('../app/syncData')(app), responseMiddleware);
  router.post('/register-device', (0, _apiKeyAuthenticator["default"])(app), require('../devices/createDeviceMiddleware')(app), responseMiddleware);
  router.get('/get-device', (0, _apiKeyAuthenticator["default"])(app), require('../devices/getDeviceMiddleware')(app), responseMiddleware);
  router.get('/get-devices', (0, _apiKeyAuthenticator["default"])(app), require('../devices/getDevicesMiddleware')(app), responseMiddleware);
  return router;
};