"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _default = new _sequelize["default"](process.env.POSTGRES_DB_NAME, process.env.POSTGRES_DB_USER, process.env.POSTGRES_DB_USER_PASS, {
  dialect: 'postgres',
  host: process.env.POSTGRES_DB_HOST,
  logging: false // process.env.NODE_ENV !== 'production'

});

exports["default"] = _default;