"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _CustomMiddleware = _interopRequireDefault(require("../../../_utils/CustomMiddleware"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var middleware = new _CustomMiddleware["default"]();
    middleware.use(function (next) {
      return require('./getAppMiddleware')(app)(req, res, next);
    });
    middleware.use(function (next) {
      return require('../users/getAuthenticatedUserMiddleware')(app)(req, res, next);
    });

    if (req.user) {
      middleware.use(function (next) {
        return require('../user-interfaces/getMyUIMiddleware')(app)(req, res, next);
      });
    }

    middleware.go(next);
  };
};