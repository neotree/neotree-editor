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

var Hospital = _sequelize2["default"].define('hospital', {
  id: {
    type: _sequelize["default"].INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  hospital_id: {
    type: _sequelize["default"].STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: _sequelize["default"].STRING,
    allowNull: false
  },
  country: {
    type: _sequelize["default"].STRING
  },
  deletedAt: {
    type: _sequelize["default"].DATE,
    defaultValue: null
  }
});

var _default = Hospital;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(Hospital, "Hospital", "/home/farai/Workbench/neotree-editor/server/database/models/_Hospital.js");
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/database/models/_Hospital.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();