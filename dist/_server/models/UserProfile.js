"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelize2 = _interopRequireDefault(require("./sequelize"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var UserProfile = _sequelize2["default"].define('user_profile', {
  id: {
    type: _sequelize["default"].UUID,
    defaultValue: function defaultValue() {
      return (0, _uuidv["default"])();
    },
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: _sequelize["default"].STRING,
    allowNull: false,
    unique: true
  },
  profile_name: {
    type: _sequelize["default"].STRING,
    allowNull: false
  },
  user_id: {
    type: _sequelize["default"].UUID // references: {
    //   model: User,
    //   key: 'id'
    // }

  },
  firstname: {
    type: _sequelize["default"].STRING
  },
  lastname: {
    type: _sequelize["default"].STRING
  }
});

var _default = UserProfile;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(UserProfile, "UserProfile", "/home/lamyfarai/Workbench/neotree-editor/_server/models/UserProfile.js");
  reactHotLoader.register(_default, "default", "/home/lamyfarai/Workbench/neotree-editor/_server/models/UserProfile.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();