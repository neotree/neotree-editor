"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelize2 = _interopRequireDefault(require("./sequelize"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var Script = _sequelize2["default"].define('app', {
  id: {
    type: _sequelize["default"].INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  version: {
    type: _sequelize["default"].INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  should_track_usage: {
    type: _sequelize["default"].BOOLEAN,
    defaultValue: false
  },
  last_backup_date: {
    type: _sequelize["default"].DATE
  },
  deletedAt: {
    type: _sequelize["default"].DATE,
    defaultValue: null
  }
});

var _default = Script;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(Script, "Script", "/home/farai/Workbench/neotree-editor/server/database/models/_App.js");
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/database/models/_App.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();