"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelize2 = _interopRequireDefault(require("./sequelize"));

var _User = _interopRequireDefault(require("./_User"));

var _Hospital = _interopRequireDefault(require("./_Hospital"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var UserHospital = _sequelize2["default"].define('user_hospital', {
  id: {
    type: _sequelize["default"].INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firebase_id: {
    type: _sequelize["default"].STRING,
    allowNull: false,
    unique: true
  },
  hospital: {
    type: _sequelize["default"].STRING,
    references: {
      model: _Hospital["default"],
      key: 'hospital_id'
    }
  },
  user: {
    type: _sequelize["default"].STRING,
    references: {
      model: _User["default"],
      key: 'email_hash'
    }
  },
  is_active: {
    type: _sequelize["default"].BOOLEAN,
    defaultValue: false
  }
});

var _default = UserHospital;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(UserHospital, "UserHospital", "/home/farai/WorkBench/neotree-editor/server/database/models/_UserHospital.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/database/models/_UserHospital.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();