"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _path = _interopRequireDefault(require("path"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _fs = _interopRequireDefault(require("fs"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res) {
    var _ref = res.locals.getResponsePayload() || {},
        app = _ref.app,
        payload = (0, _objectWithoutProperties2["default"])(_ref, ["app"]);

    var error = res.locals.getResponseError();
    var host = "".concat(req.protocol, "://").concat(req.headers.host);

    var __$APP__ = JSON.stringify(_objectSpread(_objectSpread(_objectSpread({
      host: host
    }, payload), app), error ? {
      error: error
    } : {}));

    var html = _fs["default"].readFileSync(_path["default"].resolve(__dirname, '../../src/index.html'), 'utf8');

    var $ = _cheerio["default"].load(html);

    $('head').append("<script type=\"text/javascript\">const __$APP__ = ".concat(__$APP__, ";</script>")); // $('body').append(`<script type="text/javascript" src="${host}/bundle.js"></script>`);

    res.send($.html());
  };
};