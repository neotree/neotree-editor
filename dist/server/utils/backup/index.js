"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "backupData", {
  enumerable: true,
  get: function get() {
    return _backupData["default"];
  }
});
Object.defineProperty(exports, "restoreBackup", {
  enumerable: true,
  get: function get() {
    return _restoreBackup["default"];
  }
});
Object.defineProperty(exports, "shouldBackup", {
  enumerable: true,
  get: function get() {
    return _shouldBackup["default"];
  }
});

var _shouldBackup = _interopRequireDefault(require("./shouldBackup"));

var _backupData = _interopRequireDefault(require("./backupData"));

var _restoreBackup = _interopRequireDefault(require("./restoreBackup"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};