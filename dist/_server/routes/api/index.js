"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _apiKeyAuthenticator = _interopRequireDefault(require("./apiKeyAuthenticator"));

var _responseMiddleware = _interopRequireDefault(require("../../responseMiddleware"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router.get('/key', require('./getApiKeyMiddleware')(app), _responseMiddleware["default"]);
  router.get('/download-api-config', require('./downloadApiConfigFileMiddleware')(app), _responseMiddleware["default"]);
  router.post('/generate-key', require('./generateApiKeyMiddleware')(app), _responseMiddleware["default"]);
  router.get('/get-config-keys', (0, _apiKeyAuthenticator["default"])(app), require('./getConfigKeysMiddleware')(app), _responseMiddleware["default"]);
  router.get('/get-config-key', (0, _apiKeyAuthenticator["default"])(app), require('./getConfigKeyMiddleware')(app), _responseMiddleware["default"]);
  router.get('/get-scripts', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptsMiddleware')(app), _responseMiddleware["default"]);
  router.get('/get-script', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptMiddleware')(app), _responseMiddleware["default"]);
  router.get('/get-screens', (0, _apiKeyAuthenticator["default"])(app), require('./getScreensMiddleware')(app), _responseMiddleware["default"]);
  router.get('/get-screen', (0, _apiKeyAuthenticator["default"])(app), require('./getScreenMiddleware')(app), _responseMiddleware["default"]);
  router.get('/get-diagnoses', (0, _apiKeyAuthenticator["default"])(app), require('./getDiagnosesMiddleware')(app), _responseMiddleware["default"]);
  router.get('/get-diagnosis', (0, _apiKeyAuthenticator["default"])(app), require('./getDiagnosisMiddleware')(app), _responseMiddleware["default"]);
  router.get('/sync-data', (0, _apiKeyAuthenticator["default"])(app), require('../data/syncData')(app), _responseMiddleware["default"]);
  router.get('/get-device-registration', (0, _apiKeyAuthenticator["default"])(app), require('../devices/getDeviceMiddleware')(app), _responseMiddleware["default"]);
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/_server/routes/api/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();