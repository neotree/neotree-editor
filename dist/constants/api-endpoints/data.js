"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IMPORT_FIREBASE = exports.EXPORT_DATA = exports.SYNC_DATA = exports.EXPORT_TO_FIREBASE = exports.COPY_DATA = void 0;

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var COPY_DATA = '/copy-data';
exports.COPY_DATA = COPY_DATA;
var EXPORT_TO_FIREBASE = '/export-to-firebase';
exports.EXPORT_TO_FIREBASE = EXPORT_TO_FIREBASE;
var SYNC_DATA = '/sync-data';
exports.SYNC_DATA = SYNC_DATA;
var EXPORT_DATA = '/export-data';
exports.EXPORT_DATA = EXPORT_DATA;
var IMPORT_FIREBASE = '/import-firebase';
exports.IMPORT_FIREBASE = IMPORT_FIREBASE;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(COPY_DATA, "COPY_DATA", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/data.js");
  reactHotLoader.register(EXPORT_TO_FIREBASE, "EXPORT_TO_FIREBASE", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/data.js");
  reactHotLoader.register(SYNC_DATA, "SYNC_DATA", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/data.js");
  reactHotLoader.register(EXPORT_DATA, "EXPORT_DATA", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/data.js");
  reactHotLoader.register(IMPORT_FIREBASE, "IMPORT_FIREBASE", "/home/farai/WorkBench/neotree-editor/constants/api-endpoints/data.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();