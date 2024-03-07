"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _database = require("../../database");
var _excluded = ["filters"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    var _res$locals$reqQuery = res.locals.reqQuery,
      filters = _res$locals$reqQuery.filters,
      payload = (0, _objectWithoutProperties2["default"])(_res$locals$reqQuery, _excluded);
    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };
    _database.Diagnosis.findAll(_objectSpread({
      where: payload,
      order: [['position', 'ASC']]
    }, filters)).then(function (diagnoses) {
      return done(null, {
        diagnoses: diagnoses
      });
    })["catch"](done);
  };
};