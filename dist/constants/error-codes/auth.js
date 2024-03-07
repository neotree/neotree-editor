"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UNAUTHORIZED = exports.SIGNIN_WRONG_PASSWORD = exports.SIGNIN_NO_USER = exports.SIGNIN_MISSNG_PASSWORD = void 0;
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var UNAUTHORIZED = exports.UNAUTHORIZED = 'UNAUTHORIZED';
var SIGNIN_NO_USER = exports.SIGNIN_NO_USER = 'SIGNIN_NO_USER';
var SIGNIN_WRONG_PASSWORD = exports.SIGNIN_WRONG_PASSWORD = 'SIGNIN_WRONG_PASSWORD';
var SIGNIN_MISSNG_PASSWORD = exports.SIGNIN_MISSNG_PASSWORD = 'SIGNIN_MISSNG_PASSWORD';
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(UNAUTHORIZED, "UNAUTHORIZED", "/Users/lafarai/WorkBench/BWS/neotree-editor/constants/error-codes/auth.js");
  reactHotLoader.register(SIGNIN_NO_USER, "SIGNIN_NO_USER", "/Users/lafarai/WorkBench/BWS/neotree-editor/constants/error-codes/auth.js");
  reactHotLoader.register(SIGNIN_WRONG_PASSWORD, "SIGNIN_WRONG_PASSWORD", "/Users/lafarai/WorkBench/BWS/neotree-editor/constants/error-codes/auth.js");
  reactHotLoader.register(SIGNIN_MISSNG_PASSWORD, "SIGNIN_MISSNG_PASSWORD", "/Users/lafarai/WorkBench/BWS/neotree-editor/constants/error-codes/auth.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();