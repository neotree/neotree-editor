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
  router.get('/get-diagnoses', require('./getDiagnosesMiddleware')(app), app.responseMiddleware);
  router.get('/get-diagnosis', require('./getDiagnosisMiddleware')(app), app.responseMiddleware);
  router.post('/create-diagnosis', require('./createDiagnosisMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/update-diagnosis', require('./updateDiagnosisMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/update-diagnoses', require('./updateDiagnosesMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/delete-diagnoses', require('./deleteDiagnosesMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/duplicate-diagnoses', require('./duplicateDiagnosesMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, app.responseMiddleware);
  router.post('/copy-diagnoses', require('./copyDiagnosesMiddleware')(app), function (req, res, next) {
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

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/_server/routes/diagnoses/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();