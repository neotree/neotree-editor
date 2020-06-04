"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _apiKeyAuthenticator = _interopRequireDefault(require("./apiKeyAuthenticator"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  var responseMiddleware = app.responseMiddleware;
  router.get('/key', require('./getApiKeyMiddleware')(app), responseMiddleware);
  router.get('/download-api-config', require('./downloadApiConfigFileMiddleware')(app), responseMiddleware);
  router.post('/generate-key', require('./generateApiKeyMiddleware')(app), responseMiddleware);
  router.get('/get-scripts', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptsMiddleware')(app), responseMiddleware);
  router.get('/get-script', (0, _apiKeyAuthenticator["default"])(app), require('./getScriptMiddleware')(app), responseMiddleware);
  router.get('/get-screens', (0, _apiKeyAuthenticator["default"])(app), require('./getScreensMiddleware')(app), responseMiddleware);
  router.get('/get-screens', (0, _apiKeyAuthenticator["default"])(app), require('./getScreensMiddleware')(app), responseMiddleware);
  router.get('/get-data-activity-info', (0, _apiKeyAuthenticator["default"])(app), require('../app/getDataActivityInfo')(app), responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/lamyfarai/Workbench/neotree-editor/_server/routes/api/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();