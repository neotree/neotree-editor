"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function (req, res, next) {
  res.locals.$errors = [];
  res.locals.$warnings = [];
  res.locals.$data = null;
  res.locals.setResponse = function (err, data, warning) {
    if (err) {
      res.locals.$errors = [].concat((0, _toConsumableArray2["default"])(res.locals.$errors), (0, _toConsumableArray2["default"])(err && err.map ? err : [err]));
    }
    if (warning) {
      res.locals.$warnings = [].concat((0, _toConsumableArray2["default"])(res.locals.$warnings), (0, _toConsumableArray2["default"])(warning && warning.map ? warning : [warning]));
    }
    if (data) res.locals.$data = _objectSpread(_objectSpread({}, res.locals.$data), data);
  };
  res.locals.getResponse = function () {
    return _objectSpread(_objectSpread(_objectSpread({}, res.locals.$data), res.locals.$errors.length ? {
      errors: res.locals.$errors
    } : {}), res.locals.$warnings.length ? {
      warnings: res.locals.$warnings
    } : {});
  };
  next();
};