"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Sequelize", {
  enumerable: true,
  get: function get() {
    return _sequelize["default"];
  }
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _server = _interopRequireDefault(require("../../config/server"));

var dbConfig = _server["default"].database;
var sequelize = new _sequelize["default"](process.env.DATABASE_NAME || dbConfig.database, process.env.DATABASE_USERNAME || dbConfig.username, process.env.DATABASE_PASSWORD || dbConfig.password, {
  host: dbConfig.host || 'localhost',
  dialect: 'postgres',
  logging: false
});
var _default = sequelize;
exports["default"] = _default;