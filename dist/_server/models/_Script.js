"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelize2 = _interopRequireDefault(require("./sequelize"));

var _firebase = _interopRequireDefault(require("../firebase"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var Script = _sequelize2["default"].define('script', {
  id: {
    type: _sequelize["default"].STRING,
    allowNull: false,
    primaryKey: true
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
  }
});

Script.afterUpdate(function (script) {
  var _JSON$parse = JSON.parse(JSON.stringify(script)),
      id = _JSON$parse.id,
      _JSON$parse$data = _JSON$parse.data,
      cAt = _JSON$parse$data.createdAt,
      data = (0, _objectWithoutProperties2["default"])(_JSON$parse$data, ["createdAt"]),
      createdAt = _JSON$parse.createdAt,
      scr = (0, _objectWithoutProperties2["default"])(_JSON$parse, ["id", "data", "createdAt"]); // eslint-disable-line


  _firebase["default"].database().ref("scripts/".concat(id)).update((0, _objectSpread2["default"])({}, data, {}, scr, {
    updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
  }));

  return new Promise(function (resolve) {
    return resolve(script);
  });
});
Script.afterDestroy(function (instance) {
  _firebase["default"].database().ref("screens/".concat(instance.id)).remove();

  _firebase["default"].database().ref("diagnosis/".concat(instance.id)).remove();

  _firebase["default"].database().ref("scripts/".concat(instance.id)).remove();

  return new Promise(function (resolve) {
    return resolve(instance);
  });
});
var _default = Script;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(Script, "Script", "/home/lamyfarai/Workbench/neotree-editor/_server/models/_Script.js");
  reactHotLoader.register(_default, "default", "/home/lamyfarai/Workbench/neotree-editor/_server/models/_Script.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();