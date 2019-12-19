"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _webpack = _interopRequireDefault(require("webpack"));

var _webpackDevMiddleware = _interopRequireDefault(require("webpack-dev-middleware"));

var _webpackHotMiddleware = _interopRequireDefault(require("webpack-hot-middleware"));

var _webpackDevelopment = _interopRequireDefault(require("../../webpack.development.config"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  // webpack
  var compiler = (0, _webpack["default"])(_webpackDevelopment["default"]);
  var wdm = (0, _webpackDevMiddleware["default"])(compiler, {
    noInfo: true,
    publicPath: _webpackDevelopment["default"].output.publicPath
  });
  app.wdm = wdm;
  app.use(wdm);
  app.use((0, _webpackHotMiddleware["default"])(compiler));
  return app;
};