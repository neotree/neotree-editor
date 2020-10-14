"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelize2 = _interopRequireDefault(require("./sequelize"));

var File = _sequelize2["default"].define('file', {
  id: {
    type: _sequelize["default"].STRING,
    allowNull: false,
    primaryKey: true
  },
  metadata: {
    type: _sequelize["default"].JSON,
    defaultValue: JSON.stringify({}),
    get: function get() {
      return JSON.parse(this.getDataValue('metadata') || '{}');
    },
    set: function set(value) {
      this.setDataValue('metadata', (typeof data === "undefined" ? "undefined" : (0, _typeof2["default"])(data)) === 'object' ? JSON.stringify(value) : value);
    }
  },
  filename: {
    type: _sequelize["default"].STRING
  },
  content_type: {
    type: _sequelize["default"].STRING
  },
  size: {
    type: _sequelize["default"].BIGINT
  },
  data: {
    type: _sequelize["default"].BLOB('long')
  },
  uploaded_by: {
    type: _sequelize["default"].UUID // references: {
    //   model: User,
    //   key: 'id'
    // }

  }
});

var _default = File;
exports["default"] = _default;