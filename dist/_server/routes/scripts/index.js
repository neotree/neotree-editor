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
  router.get('/get-scripts', require('./getScriptsMiddleware')(app), app.responseMiddleware);
  router.get('/get-script', require('./getScriptMiddleware')(app), app.responseMiddleware);
  router.get('/get-script-items', require('./getScriptItemsMiddleware')(app), app.responseMiddleware);
  router.post('/create-script', require('./createScriptMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/update-script', require('./updateScriptMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/update-scripts', require('./updateScriptsMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/delete-scripts', require('./deleteScriptsMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/duplicate-scripts', require('./duplicateScriptsMiddleware')["default"](app), function (req, res, next) {
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

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/_server/routes/scripts/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();