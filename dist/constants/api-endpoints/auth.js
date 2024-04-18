"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SIGN_UP = exports.SIGN_OUT = exports.SIGN_IN = exports.GET_AUTHENTICATED_USER = exports.CHECK_EMAIL_REGISTRATION = void 0;
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var SIGN_UP = exports.SIGN_UP = '/sign-up';
var SIGN_IN = exports.SIGN_IN = '/sign-in';
var SIGN_OUT = exports.SIGN_OUT = '/logout';
var GET_AUTHENTICATED_USER = exports.GET_AUTHENTICATED_USER = '/get-authenticated-user';
var CHECK_EMAIL_REGISTRATION = exports.CHECK_EMAIL_REGISTRATION = '/check-email-registration';
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(SIGN_UP, "SIGN_UP", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/auth.js");
  reactHotLoader.register(SIGN_IN, "SIGN_IN", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/auth.js");
  reactHotLoader.register(SIGN_OUT, "SIGN_OUT", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/auth.js");
  reactHotLoader.register(GET_AUTHENTICATED_USER, "GET_AUTHENTICATED_USER", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/auth.js");
  reactHotLoader.register(CHECK_EMAIL_REGISTRATION, "CHECK_EMAIL_REGISTRATION", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/auth.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();