"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var _default = {
  getStructure: function getStructure(_ref) {
    var User = _ref.User,
        Sequelize = _ref.Sequelize;
    return {
      // eslint-disable-line
      id: {
        type: Sequelize.UUID,
        defaultValue: function defaultValue() {
          return (0, _uuidv["default"])();
        },
        allowNull: false,
        primaryKey: true
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: JSON.stringify({}),
        get: function get() {
          return JSON.parse(this.getDataValue('metadata') || '{}');
        },
        set: function set(value) {
          this.setDataValue('metadata', (typeof data === "undefined" ? "undefined" : (0, _typeof2["default"])(data)) === 'object' ? JSON.stringify(value) : value);
        }
      },
      filename: {
        type: Sequelize.STRING
      },
      content_type: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.BIGINT
      },
      data: {
        type: Sequelize.BLOB('long')
      },
      uploaded_by: {
        type: Sequelize.UUID // references: {
        //   model: User,
        //   key: 'id'
        // }

      }
    };
  }
};
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/models/File/index.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();