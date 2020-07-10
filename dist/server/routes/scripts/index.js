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
  var responseMiddleware = app.responseMiddleware;
  router.get('/get-scripts', require('./getScriptsMiddleware')(app), responseMiddleware);
  router.get('/get-script', require('./getScriptMiddleware')(app), responseMiddleware);
  router.get('/get-full-script', require('./getFullScriptMiddleware')(app), responseMiddleware);
  router.get('/get-script-items', require('./getScriptItemsMiddleware')(app), responseMiddleware);
  router.post('/create-script', require('./createScriptMiddleware')(app), responseMiddleware);
  router.post('/update-script', require('./updateScriptMiddleware')(app), responseMiddleware);
  router.post('/update-scripts', require('./updateScriptsMiddleware')(app), responseMiddleware);
  router.post('/delete-script', require('./deleteScriptMiddleware')(app), responseMiddleware);
  router.post('/duplicate-script', require('./duplicateScriptMiddleware')["default"](app), responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/server/routes/scripts/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();