"use strict";

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

/*eslint-disable no-console*/
var isProd = process.env.NODE_ENV === 'production';
module.exports = {
  log: function log() {
    var _console;

    return !isProd && (_console = console).log.apply(_console, arguments);
  },
  error: function error() {
    var _console2;

    return !isProd && (_console2 = console).error.apply(_console2, arguments);
  }
};
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(isProd, "isProd", "/home/lamyfarai/Workbench/neotree-editor/_utils/logger.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();