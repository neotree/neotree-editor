"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DELETE_HOSPITALS = exports.UPDATE_HOSPITALS = exports.UPDATE_HOSPITAL = exports.ADD_HOSPITAL = exports.GET_HOSPITAL = exports.GET_HOSPITALS = void 0;

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var GET_HOSPITALS = '/get-hospitals';
exports.GET_HOSPITALS = GET_HOSPITALS;
var GET_HOSPITAL = '/get-hospital';
exports.GET_HOSPITAL = GET_HOSPITAL;
var ADD_HOSPITAL = '/add-hospital';
exports.ADD_HOSPITAL = ADD_HOSPITAL;
var UPDATE_HOSPITAL = '/update-hospital';
exports.UPDATE_HOSPITAL = UPDATE_HOSPITAL;
var UPDATE_HOSPITALS = '/update-hospitals';
exports.UPDATE_HOSPITALS = UPDATE_HOSPITALS;
var DELETE_HOSPITALS = '/delete-hospitals';
exports.DELETE_HOSPITALS = DELETE_HOSPITALS;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(GET_HOSPITALS, "GET_HOSPITALS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(GET_HOSPITAL, "GET_HOSPITAL", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(ADD_HOSPITAL, "ADD_HOSPITAL", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(UPDATE_HOSPITAL, "UPDATE_HOSPITAL", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(UPDATE_HOSPITALS, "UPDATE_HOSPITALS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/hospitals.js");
  reactHotLoader.register(DELETE_HOSPITALS, "DELETE_HOSPITALS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/hospitals.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();