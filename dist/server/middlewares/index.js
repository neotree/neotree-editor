"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.locals.$req_start_time = new Date();
    res.locals.$req_key = "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2)).toUpperCase();
    next();
  });
  app.use(function (req, res, next) {
    res.locals.$logs = [];

    res.locals.pushLog = function (e) {
      res.locals.$logs = [].concat((0, _toConsumableArray2["default"])(res.locals.$logs), [e]);
    };

    next();
  });
  app.use(function (req, res, next) {
    var response = {};
    res.locals._response_ = response;

    res.locals.resetResponse = function () {
      return res.locals._response_ = response;
    };

    res.locals.setResponse = function (err, payload) {
      var errors = res.locals._response_.errors;

      if (err) {
        console.log(err);
        err = err.message || err.msg || JSON.stringify(err);
        errors = [].concat((0, _toConsumableArray2["default"])(errors || []), (0, _toConsumableArray2["default"])(err.map ? err : [err]));
      }

      res.locals._response_ = _objectSpread(_objectSpread({
        errors: errors
      }, res.locals._response_), payload);
    };

    next();
  });
  app.responseMiddleware = require('./responseMiddleware')(app);
  app = require('./passport')(app);
  return app;
};