"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _firebase = _interopRequireDefault(require("../firebase"));

var _models = require("../models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
          _configKeys = _ref2[0],
          _scripts = _ref2[1],
          _screens = _ref2[2],
          _diagnosis = _ref2[3];

      var sortData = function sortData() {
        var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        return arr.sort(function (a, b) {
          return a.position - b.position;
        });
      };

      var configKeys = sortData(Object.keys(_configKeys).map(function (id) {
        return _objectSpread({
          id: id
        }, _configKeys[id]);
      }));
      var scripts = sortData(Object.keys(_scripts).map(function (script_id) {
        return _objectSpread({
          script_id: script_id
        }, _scripts[script_id]);
      }));
      configKeys.forEach(function (_ref3, i) {
        var id = _ref3.id,
            key = (0, _objectWithoutProperties2["default"])(_ref3, ["id"]);
        return promises.push(_models.ConfigKey.findOrCreate({
          where: {
            id: id
          },
          defaults: {
            position: i + 1,
            data: JSON.stringify(key)
          }
        }));
      });
      scripts.forEach(function (_ref4, i) {
        var script_id = _ref4.script_id,
            script = (0, _objectWithoutProperties2["default"])(_ref4, ["script_id"]);
        var screens = sortData(Object.keys(_screens[script_id] || {}).map(function (screen_id) {
          return _objectSpread({
            screen_id: screen_id
          }, _screens[script_id][screen_id]);
        }));
        var diagnosis = sortData(Object.keys(_diagnosis[script_id] || {}).map(function (diagnosis_id) {
          return _objectSpread({
            diagnosis_id: diagnosis_id
          }, _diagnosis[script_id][diagnosis_id]);
        }));
        promises.push(_models.Script.findOrCreate({
          where: {
            id: script_id
          },
          defaults: {
            position: i + 1,
            data: JSON.stringify(script)
          }
        }));
        screens.forEach(function (_ref5, position) {
          var screen_id = _ref5.screen_id,
              s = (0, _objectWithoutProperties2["default"])(_ref5, ["screen_id"]);
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
        diagnosis.forEach(function (_ref6, position) {
          var diagnosis_id = _ref6.diagnosis_id,
              d = (0, _objectWithoutProperties2["default"])(_ref6, ["diagnosis_id"]);
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

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/firebase/import.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();