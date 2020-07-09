"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _firebase = _interopRequireDefault(require("../firebase"));

var _models = require("../models");

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

      Object.keys(configKeys).forEach(function (id, i) {
        return promises.push(_models.ConfigKey.findOrCreate({
          where: {
            id: id
          },
          defaults: {
            position: i + 1,
            data: JSON.stringify(configKeys[id])
          }
        }));
      });
      Object.keys(scripts).forEach(function (script_id, i) {
        promises.push(_models.Script.findOrCreate({
          where: {
            id: script_id
          },
          defaults: {
            position: i + 1,
            data: JSON.stringify(scripts[script_id])
          }
        }));
        Object.keys(screens[script_id] || {}).forEach(function (screen_id, position) {
          var s = screens[script_id][screen_id];
          position = position + 1;
          promises.push(_models.Screen.findOrCreate({
            where: {
              screen_id: screen_id,
              script_id: script_id
            },
            defaults: {
              script_id: script_id,
              screen_id: screen_id,
              position: s.position || position,
              type: s.type,
              data: JSON.stringify(s)
            }
          }));
        });
        Object.keys(diagnosis[script_id] || {}).forEach(function (diagnosis_id, position) {
          var d = diagnosis[script_id][diagnosis_id];
          position = position + 1;
          promises.push(_models.Diagnosis.findOrCreate({
            where: {
              diagnosis_id: diagnosis_id,
              script_id: script_id
            },
            defaults: {
              script_id: script_id,
              diagnosis_id: diagnosis_id,
              position: d.position || position,
              data: JSON.stringify(d)
            }
          }));
        });
      });
      Promise.all(promises).then(resolve)["catch"](reject);
    });
  });
};

exports["default"] = _default;