"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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