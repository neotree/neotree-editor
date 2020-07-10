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
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var User = _sequelize2["default"].define('user', {
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
    allowNull: false
  },
  password: {
    type: _sequelize["default"].STRING
  },
  role: {
    type: _sequelize["default"].INTEGER,
    defaultValue: 0
  }
});

var _default = User;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(User, "User", "/home/farai/WorkBench/neotree-editor/server/models/_User.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/models/_User.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();