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
var GET_USERS = '/get-users';
exports.GET_USERS = GET_USERS;
var UPDATE_USER = '/update-user';
exports.UPDATE_USER = UPDATE_USER;
var UPDATE_USERS = '/update-users';
exports.UPDATE_USERS = UPDATE_USERS;
var ADD_USER = '/add-user';
exports.ADD_USER = ADD_USER;
var DELETE_USERS = '/delete-users';
exports.DELETE_USERS = DELETE_USERS;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(GET_USERS, "GET_USERS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/users.js");
  reactHotLoader.register(UPDATE_USER, "UPDATE_USER", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/users.js");
  reactHotLoader.register(UPDATE_USERS, "UPDATE_USERS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/users.js");
  reactHotLoader.register(ADD_USER, "ADD_USER", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/users.js");
  reactHotLoader.register(DELETE_USERS, "DELETE_USERS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/users.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();