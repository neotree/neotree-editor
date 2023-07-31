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
var Device = _sequelize2["default"].define('device', {
  id: {
    type: _sequelize["default"].INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  device_id: {
    type: _sequelize["default"].STRING,
    allowNull: false
  },
  device_hash: {
    type: _sequelize["default"].STRING,
    allowNull: false
  },
  details: {
    type: _sequelize["default"].JSON,
    defaultValue: JSON.stringify({}),
    get: function get() {
      return JSON.parse(this.getDataValue('details') || '{}');
    },
    set: function set(value) {
      this.setDataValue('details', (typeof data === "undefined" ? "undefined" : (0, _typeof2["default"])(data)) === 'object' ? JSON.stringify(value) : value);
    }
  },
  deletedAt: {
    type: _sequelize["default"].DATE,
    defaultValue: null
  }
});
var _default = Device;
var _default2 = _default;
exports["default"] = _default2;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(Device, "Device", "/home/farai/Workbench/neotree-editor/server/database/models/_Device.js");
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/database/models/_Device.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();