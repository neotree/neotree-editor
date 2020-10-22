"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.COPY_SCREENS = exports.DUPLICATE_SCREENS = exports.DELETE_SCREENS = exports.UPDATE_SCREENS = exports.UPDATE_SCREEN = exports.CREATE_SCREEN = exports.GET_SCREEN_ITEMS = exports.GET_FULL_SCREEN = exports.GET_SCREENS = exports.GET_SCREEN = void 0;

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var GET_SCREEN = '/get-screen';
exports.GET_SCREEN = GET_SCREEN;
var GET_SCREENS = '/get-screens';
exports.GET_SCREENS = GET_SCREENS;
var GET_FULL_SCREEN = '/get-full-screen';
exports.GET_FULL_SCREEN = GET_FULL_SCREEN;
var GET_SCREEN_ITEMS = '/get-screen-items';
exports.GET_SCREEN_ITEMS = GET_SCREEN_ITEMS;
var CREATE_SCREEN = '/create-screen';
exports.CREATE_SCREEN = CREATE_SCREEN;
var UPDATE_SCREEN = '/update-screen';
exports.UPDATE_SCREEN = UPDATE_SCREEN;
var UPDATE_SCREENS = '/update-screens';
exports.UPDATE_SCREENS = UPDATE_SCREENS;
var DELETE_SCREENS = '/delete-screens';
exports.DELETE_SCREENS = DELETE_SCREENS;
var DUPLICATE_SCREENS = '/duplicate-screens';
exports.DUPLICATE_SCREENS = DUPLICATE_SCREENS;
var COPY_SCREENS = '/copy-screens';
exports.COPY_SCREENS = COPY_SCREENS;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(GET_SCREEN, "GET_SCREEN", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
  reactHotLoader.register(GET_SCREENS, "GET_SCREENS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
  reactHotLoader.register(GET_FULL_SCREEN, "GET_FULL_SCREEN", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
  reactHotLoader.register(GET_SCREEN_ITEMS, "GET_SCREEN_ITEMS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
  reactHotLoader.register(CREATE_SCREEN, "CREATE_SCREEN", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
  reactHotLoader.register(UPDATE_SCREEN, "UPDATE_SCREEN", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
  reactHotLoader.register(UPDATE_SCREENS, "UPDATE_SCREENS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
  reactHotLoader.register(DELETE_SCREENS, "DELETE_SCREENS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
  reactHotLoader.register(DUPLICATE_SCREENS, "DUPLICATE_SCREENS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
  reactHotLoader.register(COPY_SCREENS, "COPY_SCREENS", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/screens.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();