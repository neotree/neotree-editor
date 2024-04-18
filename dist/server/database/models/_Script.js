"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _sequelize = _interopRequireDefault(require("sequelize"));
var _sequelize2 = _interopRequireDefault(require("./sequelize"));
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var Script = _sequelize2["default"].define('script', {
  id: {
    type: _sequelize["default"].INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  script_id: {
    type: _sequelize["default"].STRING,
    allowNull: false
  },
  position: {
    type: _sequelize["default"].INTEGER
  },
  data: {
    type: _sequelize["default"].JSON,
    defaultValue: JSON.stringify({}),
    get: function get() {
      return JSON.parse(this.getDataValue('data') || '{}');
    },
    set: function set(value) {
      this.setDataValue('data', (typeof data === "undefined" ? "undefined" : (0, _typeof2["default"])(data)) === 'object' ? JSON.stringify(value) : value);
    }
  },
  deletedAt: {
    type: _sequelize["default"].DATE,
    defaultValue: null
  }
});
var _default = Script;
var _default2 = exports["default"] = _default;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(Script, "Script", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/database/models/_Script.js");
  reactHotLoader.register(_default, "default", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/database/models/_Script.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();