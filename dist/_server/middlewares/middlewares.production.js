"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _compression = _interopRequireDefault(require("compression"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  app.use((0, _compression["default"])());
  return app;
};