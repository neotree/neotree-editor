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

var Diagnosis = _sequelize2["default"].define('diagnosis', {
  id: {
    type: _sequelize["default"].INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  diagnosis_id: {
    type: _sequelize["default"].STRING,
    allowNull: false
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
  position: {
    type: _sequelize["default"].INTEGER
  },
  script_id: {
    type: _sequelize["default"].STRING // references: {
    //   model: Script,
    //   key: 'id'
    // }

  },
  deletedAt: {
    type: _sequelize["default"].DATE
  }
}); // Diagnosis.afterUpdate(diagnosis => {
//   const { id, diagnosis_id, data: { createdAt: cAt, ...data }, createdAt, ...d } = JSON.parse(JSON.stringify(diagnosis)); // eslint-disable-line
//   firebase.database().ref(`diagnosis/${diagnosis.script_id}/${diagnosis_id}`).update({
//     ...data,
//     ...d,
//     updatedAt: firebase.database.ServerValue.TIMESTAMP
//   });
//   return new Promise(resolve => resolve(diagnosis));
// });
// Diagnosis.afterDestroy(instance => {
//   firebase.database().ref(`diagnosis/${instance.script_id}/${instance.diagnosis_id}`).remove();
//   return new Promise(resolve => resolve(instance));
// });


var _default = Diagnosis;
var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(Diagnosis, "Diagnosis", "/home/farai/WorkBench/neotree-editor/_server/models/_Diagnosis.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/_server/models/_Diagnosis.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();