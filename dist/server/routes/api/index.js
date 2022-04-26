"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _express = _interopRequireDefault(require("express"));

var _apiKeyAuthenticator = _interopRequireDefault(require("./apiKeyAuthenticator"));

var _countlySdkNodejs = _interopRequireDefault(require("countly-sdk-nodejs"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router.post('/add-stats', function (req, res) {
    var stats = req.body.stats || [];

    _countlySdkNodejs["default"].init({
      app_key: process.env.COUNTLY_APP_KEY,
      url: process.env.COUNTLY_HOST,
      debug: true
    }); // Countly.begin_session();


    stats.forEach(function (stat) {
      _countlySdkNodejs["default"].add_event({
        key: stat.type,
        count: stat.count,
        // sum: 0,
        dur: stat.duration,
        segmentation: _objectSpread({}, stat.data)
      });
    });
    res.json({
      success: true
    });
  });
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
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/Workbench/neotree-editor/server/routes/api/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();