"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router.get('/get-config-keys', require('./getConfigKeysMiddleware')(app), app.responseMiddleware);
  router.get('/get-config-key', require('./getConfigKeyMiddleware')(app), app.responseMiddleware);
  router.post('/create-config-key', require('./createConfigKeyMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/update-config-key', require('./updateConfigKeyMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/update-config-keys', require('./updateConfigKeysMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/delete-config-keys', require('./deleteConfigKeysMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/duplicate-config-keys', require('./duplicateConfigKeysMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/_server/routes/config-keys/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();