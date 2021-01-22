"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/diagnoses"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router.get(endpoints.GET_DIAGNOSES, require('./getDiagnosesMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_DIAGNOSIS, require('./getDiagnosisMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.CREATE_DIAGNOSIS, require('./createDiagnosisMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_DIAGNOSIS, require('./updateDiagnosisMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_DIAGNOSES, require('./updateDiagnosesMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.DELETE_DIAGNOSES, require('./deleteDiagnosesMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.DUPLICATE_DIAGNOSES, require('./duplicateDiagnosesMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.COPY_DIAGNOSES, require('./copyDiagnosesMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/server/routes/diagnoses/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();