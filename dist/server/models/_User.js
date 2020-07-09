"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelize2 = _interopRequireDefault(require("./sequelize"));

/* eslint-disable object-shorthand */
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
exports["default"] = _default;