"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _getAppMiddleware = _interopRequireDefault(require("./getAppMiddleware"));

var _getAuthenticatedUserMiddleware = _interopRequireDefault(require("../users/getAuthenticatedUserMiddleware"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _getAppMiddleware["default"])(app)(req, res, function () {
      (0, _getAuthenticatedUserMiddleware["default"])(app)(req, res, function () {
        next();
        return null;
      });
    });
  };
};