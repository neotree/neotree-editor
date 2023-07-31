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
var SIGN_UP = '/sign-up';
exports.SIGN_UP = SIGN_UP;
var SIGN_IN = '/sign-in';
exports.SIGN_IN = SIGN_IN;
var SIGN_OUT = '/logout';
exports.SIGN_OUT = SIGN_OUT;
var GET_AUTHENTICATED_USER = '/get-authenticated-user';
exports.GET_AUTHENTICATED_USER = GET_AUTHENTICATED_USER;
var CHECK_EMAIL_REGISTRATION = '/check-email-registration';
exports.CHECK_EMAIL_REGISTRATION = CHECK_EMAIL_REGISTRATION;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(SIGN_UP, "SIGN_UP", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/auth.js");
  reactHotLoader.register(SIGN_IN, "SIGN_IN", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/auth.js");
  reactHotLoader.register(SIGN_OUT, "SIGN_OUT", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/auth.js");
  reactHotLoader.register(GET_AUTHENTICATED_USER, "GET_AUTHENTICATED_USER", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/auth.js");
  reactHotLoader.register(CHECK_EMAIL_REGISTRATION, "CHECK_EMAIL_REGISTRATION", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/auth.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();