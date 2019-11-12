"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _firebase = _interopRequireDefault(require("../firebase"));

var _models = require("../models");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var _default = function _default() {
  return new Promise(function (resolve, reject) {
    var db = _firebase["default"].database();

    var promises = [];

    var getData = function getData(collection) {
      return new Promise(function (resolve) {
        return db.ref(collection).on('value', function (snap) {
          return resolve(snap.val());
        });
      });
    };

    Promise.all([getData('configkeys'), getData('scripts'), getData('screens'), getData('diagnosis')]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 4),
          configKeys = _ref2[0],
          scripts = _ref2[1],
          screens = _ref2[2],
          diagnosis = _ref2[3];

      Object.keys(configKeys).forEach(function (id) {
        return promises.push(_models.ConfigKey.findOrCreate({
          where: {
            id: id
          },
          defaults: {
            data: JSON.stringify(configKeys[id])
          }
        }));
      });
      Object.keys(scripts).forEach(function (id) {
        return promises.push(_models.Script.findOrCreate({
          where: {
            id: id
          },
          defaults: {
            data: JSON.stringify(scripts[id])
          }
        }));
      });
      Object.keys(screens).forEach(function (script_id) {
        Object.keys(screens[script_id]).forEach(function (id, position) {
          position = position + 1;
          promises.push(_models.Screen.findOrCreate({
            where: {
              id: id
            },
            defaults: {
              script_id: script_id,
              position: screens[script_id][id].position || position,
              type: screens[script_id][id].type,
              data: JSON.stringify(screens[script_id][id])
            }
          }));
        });
      });
      Object.keys(diagnosis).forEach(function (script_id) {
        Object.keys(diagnosis[script_id]).forEach(function (id, position) {
          position = position + 1;
          promises.push(_models.Diagnosis.findOrCreate({
            where: {
              id: id
            },
            defaults: {
              script_id: script_id,
              position: diagnosis[script_id][id].position || position,
              data: JSON.stringify(diagnosis[script_id][id])
            }
          }));
        });
      });
      Promise.all(promises).then(resolve)["catch"](reject);
    });
  });
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, "default", "/home/bws/WorkBench/neotree-editor/_server/firebase/import.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();