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
  router.get('/export-data', require('./exportDataMiddleware')(app));
  router.post('/import-firebase', require('./copyDataMiddleware')(app), app.responseMiddleware);
  router.post('/export-to-firebase', require('./exportToFirebaseMiddleware')(app), app.responseMiddleware);
  router.get('/sync-data', require('./syncData')(app), app.responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/_server/routes/data/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();