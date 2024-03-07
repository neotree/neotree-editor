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
var UNAUTHORIZED = exports.UNAUTHORIZED = 'Not authorised';
var SIGNIN_NO_USER = exports.SIGNIN_NO_USER = 'Incorrect username or password';
var SIGNIN_WRONG_PASSWORD = exports.SIGNIN_WRONG_PASSWORD = 'Incorrect username or password';
var SIGNIN_MISSNG_PASSWORD = exports.SIGNIN_MISSNG_PASSWORD = 'Incorrect username or password';
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(UNAUTHORIZED, "UNAUTHORIZED", "/Users/lafarai/WorkBench/BWS/neotree-editor/constants/error-messages/auth.js");
  reactHotLoader.register(SIGNIN_NO_USER, "SIGNIN_NO_USER", "/Users/lafarai/WorkBench/BWS/neotree-editor/constants/error-messages/auth.js");
  reactHotLoader.register(SIGNIN_WRONG_PASSWORD, "SIGNIN_WRONG_PASSWORD", "/Users/lafarai/WorkBench/BWS/neotree-editor/constants/error-messages/auth.js");
  reactHotLoader.register(SIGNIN_MISSNG_PASSWORD, "SIGNIN_MISSNG_PASSWORD", "/Users/lafarai/WorkBench/BWS/neotree-editor/constants/error-messages/auth.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();