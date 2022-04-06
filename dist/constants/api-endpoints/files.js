"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UPLOAD_FILE = exports.GET_FILE = void 0;

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var GET_FILE = '/file/:fileId';
exports.GET_FILE = GET_FILE;
var UPLOAD_FILE = '/upload-file';
exports.UPLOAD_FILE = UPLOAD_FILE;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(GET_FILE, "GET_FILE", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/files.js");
  reactHotLoader.register(UPLOAD_FILE, "UPLOAD_FILE", "/home/farai/Workbench/neotree-editor/constants/api-endpoints/files.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();