"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelize2 = _interopRequireDefault(require("./sequelize"));

var _User = _interopRequireDefault(require("./_User"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var UserCountry = _sequelize2["default"].define('user_country', {
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
  country: {
    type: _sequelize["default"].STRING
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

var _default = UserCountry;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(UserCountry, "UserCountry", "/home/farai/WorkBench/neotree-editor/server/database/models/_UserCountry.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/database/models/_UserCountry.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();