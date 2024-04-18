"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPDATE_USERS = exports.UPDATE_USER = exports.GET_USERS = exports.DELETE_USERS = exports.ADD_USER = void 0;
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var GET_USERS = exports.GET_USERS = '/get-users';
var UPDATE_USER = exports.UPDATE_USER = '/update-user';
var UPDATE_USERS = exports.UPDATE_USERS = '/update-users';
var ADD_USER = exports.ADD_USER = '/add-user';
var DELETE_USERS = exports.DELETE_USERS = '/delete-users';
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(GET_USERS, "GET_USERS", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/users.js");
  reactHotLoader.register(UPDATE_USER, "UPDATE_USER", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/users.js");
  reactHotLoader.register(UPDATE_USERS, "UPDATE_USERS", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/users.js");
  reactHotLoader.register(ADD_USER, "ADD_USER", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/users.js");
  reactHotLoader.register(DELETE_USERS, "DELETE_USERS", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/users.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();