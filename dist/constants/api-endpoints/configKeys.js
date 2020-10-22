"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DUPLICATE_CONFIG_KEYS = exports.DELETE_CONFIG_KEYS = exports.UPDATE_CONFIG_KEYS = exports.UPDATE_CONFIG_KEY = exports.CREATE_CONFIG_KEY = exports.GET_FULL_CONFIG_KEY = exports.GET_CONFIG_KEYS = exports.GET_CONFIG_KEY = void 0;

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var GET_CONFIG_KEY = '/get-config-key';
exports.GET_CONFIG_KEY = GET_CONFIG_KEY;
var GET_CONFIG_KEYS = '/get-config-keys';
exports.GET_CONFIG_KEYS = GET_CONFIG_KEYS;
var GET_FULL_CONFIG_KEY = '/get-full-config-key';
exports.GET_FULL_CONFIG_KEY = GET_FULL_CONFIG_KEY;
var CREATE_CONFIG_KEY = '/create-config-key';
exports.CREATE_CONFIG_KEY = CREATE_CONFIG_KEY;
var UPDATE_CONFIG_KEY = '/update-config-key';
exports.UPDATE_CONFIG_KEY = UPDATE_CONFIG_KEY;
var UPDATE_CONFIG_KEYS = '/update-config-keys';
exports.UPDATE_CONFIG_KEYS = UPDATE_CONFIG_KEYS;
var DELETE_CONFIG_KEYS = '/delete-config-keys';
exports.DELETE_CONFIG_KEYS = DELETE_CONFIG_KEYS;
var DUPLICATE_CONFIG_KEYS = '/duplicate-config-keys';
exports.DUPLICATE_CONFIG_KEYS = DUPLICATE_CONFIG_KEYS;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(GET_CONFIG_KEY, "GET_CONFIG_KEY", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/configKeys.js");
  reactHotLoader.register(GET_CONFIG_KEYS, "GET_CONFIG_KEYS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/configKeys.js");
  reactHotLoader.register(GET_FULL_CONFIG_KEY, "GET_FULL_CONFIG_KEY", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/configKeys.js");
  reactHotLoader.register(CREATE_CONFIG_KEY, "CREATE_CONFIG_KEY", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/configKeys.js");
  reactHotLoader.register(UPDATE_CONFIG_KEY, "UPDATE_CONFIG_KEY", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/configKeys.js");
  reactHotLoader.register(UPDATE_CONFIG_KEYS, "UPDATE_CONFIG_KEYS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/configKeys.js");
  reactHotLoader.register(DELETE_CONFIG_KEYS, "DELETE_CONFIG_KEYS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/configKeys.js");
  reactHotLoader.register(DUPLICATE_CONFIG_KEYS, "DUPLICATE_CONFIG_KEYS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/configKeys.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();