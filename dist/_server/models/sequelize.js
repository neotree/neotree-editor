"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Sequelize", {
  enumerable: true,
  get: function get() {
    return _sequelize["default"];
  }
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _server = _interopRequireDefault(require("../../_config/server"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var dbConfig = _server["default"].database;
var sequelize = new _sequelize["default"](process.env.DATABASE_NAME || dbConfig.database, process.env.DATABASE_USERNAME || dbConfig.username, process.env.DATABASE_PASSWORD || dbConfig.password, {
  host: dbConfig.host || 'localhost',
  dialect: 'postgres',
  logging: false
});
var _default = sequelize;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(dbConfig, "dbConfig", "/home/lamyfarai/Workbench/neotree-editor/_server/models/sequelize.js");
  reactHotLoader.register(sequelize, "sequelize", "/home/lamyfarai/Workbench/neotree-editor/_server/models/sequelize.js");
  reactHotLoader.register(_default, "default", "/home/lamyfarai/Workbench/neotree-editor/_server/models/sequelize.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();