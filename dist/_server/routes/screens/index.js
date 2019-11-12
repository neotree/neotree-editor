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
  router.post('/copy-screens', require('./copyScreensMiddleware')(app), responseMiddleware);
  router.get('/get-screens', require('./getScreensMiddleware')(app), responseMiddleware);
  router.get('/get-screen', require('./getScreenMiddleware')(app), responseMiddleware);
  router.get('/get-full-screen', require('./getFullScreenMiddleware')(app), responseMiddleware);
  router.post('/create-screen', require('./createScreenMiddleware')(app), responseMiddleware);
  router.post('/update-screen', require('./updateScreenMiddleware')(app), responseMiddleware);
  router.post('/update-screens', require('./updateScreensMiddleware')["default"](app), responseMiddleware);
  router.post('/delete-screen', require('./deleteScreenMiddleware')(app), responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/bws/WorkBench/neotree-editor/_server/routes/screens/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();