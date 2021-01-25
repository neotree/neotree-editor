"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelize2 = _interopRequireDefault(require("./sequelize"));

var _firebase = _interopRequireDefault(require("../firebase"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var ConfigKey = _sequelize2["default"].define('config_key', {
  id: {
    type: _sequelize["default"].STRING,
    allowNull: false,
    primaryKey: true
  },
  config_key_id: {
    type: _sequelize["default"].STRING
  },
  position: {
    type: _sequelize["default"].INTEGER
  },
  data: {
    type: _sequelize["default"].JSON,
    defaultValue: JSON.stringify({}),
    get: function get() {
      return JSON.parse(this.getDataValue('data') || '{}');
    },
    set: function set(value) {
      this.setDataValue('data', (typeof data === "undefined" ? "undefined" : (0, _typeof2["default"])(data)) === 'object' ? JSON.stringify(value) : value);
    }
  },
  deletedAt: {
    type: _sequelize["default"].DATE
  }
}); // ConfigKey.afterUpdate(cKey => {
//   const { id, data: { createdAt: cAt, ...data }, createdAt, ...c } = JSON.parse(JSON.stringify(cKey)); // eslint-disable-line
//   firebase.database().ref(`configkeys/${id}`).update({
//     ...data,
//     ...c,
//     updatedAt: firebase.database.ServerValue.TIMESTAMP
//   });
//   return new Promise(resolve => resolve(cKey));
// });
// ConfigKey.afterDestroy(instance => {
//   firebase.database().ref(`configkeys/${instance.id}`).remove();
//   return new Promise(resolve => resolve(instance));
// });


var _default = ConfigKey;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(ConfigKey, "ConfigKey", "/home/farai/WorkBench/neotree-editor/_server/models/_ConfigKey.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/_server/models/_ConfigKey.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();