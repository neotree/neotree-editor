"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPDATE_DIAGNOSIS = exports.UPDATE_DIAGNOSES = exports.GET_FULL_DIAGNOSIS = exports.GET_DIAGNOSIS_ITEMS = exports.GET_DIAGNOSIS = exports.GET_DIAGNOSES = exports.DUPLICATE_DIAGNOSES = exports.DELETE_DIAGNOSES = exports.CREATE_DIAGNOSIS = exports.COPY_DIAGNOSES = void 0;
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var GET_DIAGNOSIS = '/get-diagnosis';
exports.GET_DIAGNOSIS = GET_DIAGNOSIS;
var GET_DIAGNOSES = '/get-diagnoses';
exports.GET_DIAGNOSES = GET_DIAGNOSES;
var GET_FULL_DIAGNOSIS = '/get-full-diagnosis';
exports.GET_FULL_DIAGNOSIS = GET_FULL_DIAGNOSIS;
var GET_DIAGNOSIS_ITEMS = '/get-diagnosis-items';
exports.GET_DIAGNOSIS_ITEMS = GET_DIAGNOSIS_ITEMS;
var CREATE_DIAGNOSIS = '/create-diagnosis';
exports.CREATE_DIAGNOSIS = CREATE_DIAGNOSIS;
var UPDATE_DIAGNOSIS = '/update-diagnosis';
exports.UPDATE_DIAGNOSIS = UPDATE_DIAGNOSIS;
var UPDATE_DIAGNOSES = '/update-diagnoses';
exports.UPDATE_DIAGNOSES = UPDATE_DIAGNOSES;
var DELETE_DIAGNOSES = '/delete-diagnoses';
exports.DELETE_DIAGNOSES = DELETE_DIAGNOSES;
var DUPLICATE_DIAGNOSES = '/duplicate-diagnoses';
exports.DUPLICATE_DIAGNOSES = DUPLICATE_DIAGNOSES;
var COPY_DIAGNOSES = '/copy-diagnoses';
exports.COPY_DIAGNOSES = COPY_DIAGNOSES;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(GET_DIAGNOSIS, "GET_DIAGNOSIS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
  reactHotLoader.register(GET_DIAGNOSES, "GET_DIAGNOSES", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
  reactHotLoader.register(GET_FULL_DIAGNOSIS, "GET_FULL_DIAGNOSIS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
  reactHotLoader.register(GET_DIAGNOSIS_ITEMS, "GET_DIAGNOSIS_ITEMS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
  reactHotLoader.register(CREATE_DIAGNOSIS, "CREATE_DIAGNOSIS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
  reactHotLoader.register(UPDATE_DIAGNOSIS, "UPDATE_DIAGNOSIS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
  reactHotLoader.register(UPDATE_DIAGNOSES, "UPDATE_DIAGNOSES", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
  reactHotLoader.register(DELETE_DIAGNOSES, "DELETE_DIAGNOSES", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
  reactHotLoader.register(DUPLICATE_DIAGNOSES, "DUPLICATE_DIAGNOSES", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
  reactHotLoader.register(COPY_DIAGNOSES, "COPY_DIAGNOSES", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/diagnoses.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();