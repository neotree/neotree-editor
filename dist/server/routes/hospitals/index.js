"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _express = _interopRequireDefault(require("express"));
var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/hospitals"));
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
  router.get(endpoints.GET_HOSPITALS, require('./getHospitalsMiddleware')(app), require('../../utils/responseMiddleware'));
  router.get(endpoints.GET_HOSPITAL, require('./getHospitalMiddleware')(app), require('../../utils/responseMiddleware'));
  router.post(endpoints.ADD_HOSPITAL, require('./addHospitalMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_HOSPITAL, require('./updateHospitalMiddleware')["default"](app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.UPDATE_HOSPITALS, require('./updateHospitalsMiddleware')(app), function (req, res, next) {
    app.io.emit('data_updated');
    next();
  }, require('../../utils/responseMiddleware'));
  router.post(endpoints.DELETE_HOSPITALS, require('./deleteHospitalsMiddleware')(app), function (req, res, next) {
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
  reactHotLoader.register(router, "router", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/hospitals/index.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();