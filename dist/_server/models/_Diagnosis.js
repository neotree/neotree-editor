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

var Diagnosis = _sequelize2["default"].define('diagnosis', {
  id: {
    type: _sequelize["default"].INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  diagnosis_id: {
    type: _sequelize["default"].STRING,
    allowNull: false
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
  position: {
    type: _sequelize["default"].INTEGER
  },
  script_id: {
    type: _sequelize["default"].STRING // references: {
    //   model: Script,
    //   key: 'id'
    // }

  }
});

Diagnosis.afterUpdate(function (diagnosis) {
  var _JSON$parse = JSON.parse(JSON.stringify(diagnosis)),
      id = _JSON$parse.id,
      diagnosis_id = _JSON$parse.diagnosis_id,
      _JSON$parse$data = _JSON$parse.data,
      cAt = _JSON$parse$data.createdAt,
      data = (0, _objectWithoutProperties2["default"])(_JSON$parse$data, ["createdAt"]),
      createdAt = _JSON$parse.createdAt,
      d = (0, _objectWithoutProperties2["default"])(_JSON$parse, ["id", "diagnosis_id", "data", "createdAt"]); // eslint-disable-line


  _firebase["default"].database().ref("diagnosis/".concat(diagnosis.script_id, "/").concat(diagnosis_id)).update((0, _objectSpread2["default"])({}, data, {}, d, {
    updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
  }));

  return new Promise(function (resolve) {
    return resolve(diagnosis);
  });
});
Diagnosis.afterDestroy(function (instance) {
  _firebase["default"].database().ref("diagnosis/".concat(instance.script_id, "/").concat(instance.diagnosis_id)).remove();

  return new Promise(function (resolve) {
    return resolve(instance);
  });
});
var _default = Diagnosis;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(Diagnosis, "Diagnosis", "/home/lamyfarai/Workbench/neotree-editor/_server/models/_Diagnosis.js");
  reactHotLoader.register(_default, "default", "/home/lamyfarai/Workbench/neotree-editor/_server/models/_Diagnosis.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();