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
  router.get('/get-screens', require('./getScreensMiddleware')(app), app.responseMiddleware);
  router.get('/get-screen', require('./getScreenMiddleware')(app), app.responseMiddleware);
  router.post('/create-screen', require('./createScreenMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/update-screen', require('./updateScreenMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/update-screens', require('./updateScreensMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/delete-screens', require('./deleteScreensMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/duplicate-screens', require('./duplicateScreensMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/copy-screens', require('./copyScreensMiddleware')(app), function (req, res, next) {
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

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/_server/routes/screens/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();