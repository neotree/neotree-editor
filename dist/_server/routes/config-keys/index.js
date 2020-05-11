"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

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
  router.get('/get-config-keys', require('./getConfigKeysMiddleware')(app), responseMiddleware);
  router.get('/get-config-key', require('./getConfigKeyMiddleware')(app), responseMiddleware);
  router.get('/get-full-config-key', require('./getFullConfigKeyMiddleware')(app), responseMiddleware);
  router.post('/create-config-key', require('./createConfigKeyMiddleware')(app), responseMiddleware);
  router.post('/update-config-key', require('./updateConfigKeyMiddleware')(app), responseMiddleware);
  router.post('/update-config-keys', require('./updateConfigKeysMiddleware')(app), responseMiddleware);
  router.post('/delete-config-key', require('./deleteConfigKeyMiddleware')(app), responseMiddleware);
  router.post('/duplicate-config-key', require('./duplicateConfigKeyMiddleware')["default"](app), responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/lamyfarai/Workbench/neotree-editor/_server/routes/config-keys/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();