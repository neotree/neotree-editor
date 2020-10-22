"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/hospitals"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router.get(endpoints.GET_HOSPITALS, require('./getHospitalsMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_HOSPITAL, require('./getHospitalMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.ADD_HOSPITAL, require('./addHospitalMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_HOSPITAL, require('./updateHospitalMiddleware')["default"](app), require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_HOSPITALS, require('./updateHospitalsMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.DELETE_HOSPITALS, require('./deleteHospitalsMiddleware')(app), require('../../utils/responseMiddleware'));
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/server/routes/hospitals/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();