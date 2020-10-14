"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelize2 = _interopRequireDefault(require("./sequelize"));

var Session = _sequelize2["default"].define('session', {
  sid: {
    type: _sequelize["default"].STRING,
    primaryKey: true
  },
  userId: _sequelize["default"].STRING,
  expires: _sequelize["default"].DATE,
  data: _sequelize["default"].STRING(50000)
});

var _default = Session;
exports["default"] = _default;