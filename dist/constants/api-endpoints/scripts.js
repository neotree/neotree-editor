"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPDATE_SCRIPTS = exports.UPDATE_SCRIPT = exports.GET_SCRIPT_ITEMS = exports.GET_SCRIPT_DIAGNOSES_SCREENS = exports.GET_SCRIPTS = exports.GET_SCRIPT = exports.GET_FULL_SCRIPT = exports.DUPLICATE_SCRIPTS = exports.DELETE_SCRIPTS = exports.CREATE_SCRIPT = void 0;

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var GET_SCRIPT = '/get-script';
exports.GET_SCRIPT = GET_SCRIPT;
var GET_SCRIPTS = '/get-scripts';
exports.GET_SCRIPTS = GET_SCRIPTS;
var GET_FULL_SCRIPT = '/get-full-script';
exports.GET_FULL_SCRIPT = GET_FULL_SCRIPT;
var GET_SCRIPT_ITEMS = '/get-script-items';
exports.GET_SCRIPT_ITEMS = GET_SCRIPT_ITEMS;
var CREATE_SCRIPT = '/create-script';
exports.CREATE_SCRIPT = CREATE_SCRIPT;
var UPDATE_SCRIPT = '/update-script';
exports.UPDATE_SCRIPT = UPDATE_SCRIPT;
var UPDATE_SCRIPTS = '/update-scripts';
exports.UPDATE_SCRIPTS = UPDATE_SCRIPTS;
var DELETE_SCRIPTS = '/delete-scripts';
exports.DELETE_SCRIPTS = DELETE_SCRIPTS;
var DUPLICATE_SCRIPTS = '/duplicate-scripts';
exports.DUPLICATE_SCRIPTS = DUPLICATE_SCRIPTS;
var GET_SCRIPT_DIAGNOSES_SCREENS = '/get-script-diagnoses-screens-count';
exports.GET_SCRIPT_DIAGNOSES_SCREENS = GET_SCRIPT_DIAGNOSES_SCREENS;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(GET_SCRIPT, "GET_SCRIPT", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
  reactHotLoader.register(GET_SCRIPTS, "GET_SCRIPTS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
  reactHotLoader.register(GET_FULL_SCRIPT, "GET_FULL_SCRIPT", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
  reactHotLoader.register(GET_SCRIPT_ITEMS, "GET_SCRIPT_ITEMS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
  reactHotLoader.register(CREATE_SCRIPT, "CREATE_SCRIPT", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
  reactHotLoader.register(UPDATE_SCRIPT, "UPDATE_SCRIPT", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
  reactHotLoader.register(UPDATE_SCRIPTS, "UPDATE_SCRIPTS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
  reactHotLoader.register(DELETE_SCRIPTS, "DELETE_SCRIPTS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
  reactHotLoader.register(DUPLICATE_SCRIPTS, "DUPLICATE_SCRIPTS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
  reactHotLoader.register(GET_SCRIPT_DIAGNOSES_SCREENS, "GET_SCRIPT_DIAGNOSES_SCREENS", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/scripts.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();