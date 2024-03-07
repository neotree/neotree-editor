"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _express = _interopRequireDefault(require("express"));
var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/diagnoses"));
var _createDiagnosisMiddleware = require("./createDiagnosisMiddleware");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
  router.post(endpoints.CREATE_DIAGNOSIS, (0, _createDiagnosisMiddleware.createDiagnosisMiddleware)(app), function (req, res, next) {
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
  reactHotLoader.register(router, "router", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/diagnoses/index.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();