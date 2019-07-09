"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _path = _interopRequireDefault(require("path"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _fs = _interopRequireDefault(require("fs"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (expressApp) {
  return function (req, res) {
    var config = expressApp.config;

    var _ref = res.locals.getResponsePayload() || {},
        app = _ref.app,
        payload = (0, _objectWithoutProperties2["default"])(_ref, ["app"]);

    var error = res.locals.getResponseError();

    var __$APP__ = JSON.stringify((0, _objectSpread2["default"])({
      host: config.host
    }, payload, {}, app, {}, error ? {
      error: error
    } : {}));

    var html = _fs["default"].readFileSync(_path["default"].resolve(__dirname, '../../src/index.html'), 'utf8');

    var $ = _cheerio["default"].load(html);

    $('head').append("<script type=\"text/javascript\">const __$APP__ = ".concat(JSON.stringify(__$APP__), ";</script>"));
    $('body').append("<script type=\"text/javascript\" src=\"".concat(config.host, "/bundle.js\"></script>"));
    res.send($.html());
  };
};