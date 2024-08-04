"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _express = _interopRequireDefault(require("express"));
var _apiKeyAuthenticator = _interopRequireDefault(require("./apiKeyAuthenticator"));
var _addStatsMiddleware = _interopRequireDefault(require("../addStatsMiddleware"));
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var router = _express["default"].Router();
module.exports = function (app) {
  router.post('/add-stats', _addStatsMiddleware["default"]);
  router = require('./configuration')["default"](app, router);
  router.post('/update-device-registration', (0, _apiKeyAuthenticator["default"])(app), require('./updateDeviceMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/key', require('./getApiKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/download-api-config', require('./downloadApiConfigFileMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post('/generate-key', require('./generateApiKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-config-keys', (0, _apiKeyAuthenticator["default"])(app), require('./getConfigKeysMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-config-key', (0, _apiKeyAuthenticator["default"])(app), require('./getConfigKeyMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-hospitals', (0, _apiKeyAuthenticator["default"])(app), require('./getHospitalsMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-scripts', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptsMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-script', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-screens', (0, _apiKeyAuthenticator["default"])(app), require('./getScreensMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-screen', (0, _apiKeyAuthenticator["default"])(app), require('./getScreenMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-diagnoses', (0, _apiKeyAuthenticator["default"])(app), require('./getDiagnosesMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-diagnosis', (0, _apiKeyAuthenticator["default"])(app), require('./getDiagnosisMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/sync-data', (0, _apiKeyAuthenticator["default"])(app), require('../data/syncData')(app), require('../../utils/responseMiddleware'));
  router.get('/get-device-registration', (0, _apiKeyAuthenticator["default"])(app), require('../devices/getDeviceMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-files', (0, _apiKeyAuthenticator["default"])(app), require('./getFilesMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/get-file-data/:fileId', (0, _apiKeyAuthenticator["default"])(app), require('./getFileDataMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get('/count-files', (0, _apiKeyAuthenticator["default"])(app), require('./countFilesMiddleware')(app), require('../../utils/responseMiddleware'));
  return router;
};
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(router, "router", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/api/index.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();