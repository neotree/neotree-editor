"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _excluded = ["url"];

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

/* global XMLHttpRequest */
var ApiFetch = /*#__PURE__*/function () {
  function ApiFetch(url, options) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, ApiFetch);
    (0, _defineProperty2["default"])(this, "request", function (method) {
      return new Promise(function (resolve, reject) {
        _this.method = method;

        _this._initRequest();

        _this._initListeners(resolve, reject);

        _this._sendRequest();
      });
    });
    (0, _defineProperty2["default"])(this, "_initRequest", function () {
      var xhr = _this.xhr = new XMLHttpRequest();
      var reqQuery = '';

      if (_this.method === 'GET') {
        reqQuery = "?payload=".concat(JSON.stringify(_objectSpread({}, _this.options.payload || {})));
      }

      xhr.open(_this.method, "".concat(_this.url).concat(reqQuery), true);
      xhr.responseType = 'json';
    });
    (0, _defineProperty2["default"])(this, "_initListeners", function (resolve, reject) {
      var xhr = _this.xhr;
      xhr.addEventListener('error', function (e) {
        if (_this.options.onError) _this.options.onError(e);
        reject(e);
      });
      xhr.addEventListener('abort', function () {
        if (_this.options.onAbort) _this.options.onAbort();
        reject({
          msg: 'Request aborted.'
        });
      });
      xhr.addEventListener('timeout', function (e) {
        _this.options.onTimeout(e);

        reject({
          msg: 'Request timeout.'
        });
      });
      xhr.addEventListener('load', _this.options.onProgress);
      xhr.addEventListener('loadend', _this.options.onProgress);
      xhr.addEventListener('loadstart', _this.options.onProgress);
      xhr.addEventListener('progress', _this.options.onProgress);
      xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.response);
      });
    });
    (0, _defineProperty2["default"])(this, "_sendRequest", function () {
      return _this.xhr.send(_this.options.payload);
    });
    this.url = url;
    this.method = 'GET';
    this.options = options;
  }

  (0, _createClass2["default"])(ApiFetch, [{
    key: "__reactstandin__regenerateByEval",
    value: // @ts-ignore
    function __reactstandin__regenerateByEval(key, code) {
      // @ts-ignore
      this[key] = eval(code);
    }
  }]);
  return ApiFetch;
}();

var makeApiCall = function makeApiCall(method) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return new Promise(function (resolve, reject) {
    var _url = null;
    var _options = {};

    if (typeof args[0] === 'string') {
      _url = args[0];
      _options = args[1];
    } else if (args[0] && args[0].url) {
      var _args$ = args[0],
          url = _args$.url,
          options = (0, _objectWithoutProperties2["default"])(_args$, _excluded);
      _url = url;
      _options = options;
    } else {
      return reject({
        msg: 'Request url not specified'
      });
    }

    new ApiFetch(_url, _objectSpread(_objectSpread({}, _options), {}, {
      method: method
    })).request(method).then(resolve)["catch"](reject);
  });
};

var _default = {
  get: function get() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return makeApiCall.apply(void 0, ['GET'].concat(args));
  },
  post: function post() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return makeApiCall.apply(void 0, ['POST'].concat(args));
  }
};
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(ApiFetch, "ApiFetch", "/home/farai/Workbench/neotree-editor/utils/Api.js");
  reactHotLoader.register(makeApiCall, "makeApiCall", "/home/farai/Workbench/neotree-editor/utils/Api.js");
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/utils/Api.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();