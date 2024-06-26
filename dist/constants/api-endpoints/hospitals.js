"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPDATE_HOSPITALS = exports.UPDATE_HOSPITAL = exports.GET_HOSPITALS = exports.GET_HOSPITAL = exports.DELETE_HOSPITALS = exports.ADD_HOSPITAL = void 0;
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var GET_HOSPITALS = exports.GET_HOSPITALS = '/get-hospitals';
var GET_HOSPITAL = exports.GET_HOSPITAL = '/get-hospital';
var ADD_HOSPITAL = exports.ADD_HOSPITAL = '/add-hospital';
var UPDATE_HOSPITAL = exports.UPDATE_HOSPITAL = '/update-hospital';
var UPDATE_HOSPITALS = exports.UPDATE_HOSPITALS = '/update-hospitals';
var DELETE_HOSPITALS = exports.DELETE_HOSPITALS = '/delete-hospitals';
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(GET_HOSPITALS, "GET_HOSPITALS", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(GET_HOSPITAL, "GET_HOSPITAL", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(ADD_HOSPITAL, "ADD_HOSPITAL", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(UPDATE_HOSPITAL, "UPDATE_HOSPITAL", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(UPDATE_HOSPITALS, "UPDATE_HOSPITALS", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(DELETE_HOSPITALS, "DELETE_HOSPITALS", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/constants/api-endpoints/hospitals.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();