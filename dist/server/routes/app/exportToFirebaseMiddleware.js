"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../models");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

module.exports = function () {
  return function (req, res, next) {
    var done = function done(err, rslts) {
      res.locals.setResponse(err, rslts);
      next();
      return null;
    };

    Promise.all([_models.Script.findAll({
      where: {}
    }), _models.Screen.findAll({
      where: {}
    }), _models.Diagnosis.findAll({
      where: {}
    }), _models.ConfigKey.findAll({
      where: {}
    })]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 4),
          scripts = _ref2[0],
          screens = _ref2[1],
          diagnoses = _ref2[2],
          configKeys = _ref2[3];

      scripts = JSON.parse(JSON.stringify(scripts));
      screens = JSON.parse(JSON.stringify(screens));
      diagnoses = JSON.parse(JSON.stringify(diagnoses));
      configKeys = JSON.parse(JSON.stringify(configKeys));
      Promise.all([].concat((0, _toConsumableArray2["default"])(scripts.map(function (_ref3) {
        var scriptId = _ref3.id,
            s = (0, _objectWithoutProperties2["default"])(_ref3, ["id"]);
        return _firebase["default"].database().ref("scripts/".concat(scriptId)).set(_objectSpread(_objectSpread({}, s.data), {}, {
          scriptId: scriptId,
          createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
          updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
        }));
      })), (0, _toConsumableArray2["default"])(screens.map(function (_ref4) {
        var id = _ref4.id,
            s = (0, _objectWithoutProperties2["default"])(_ref4, ["id"]);
        return _firebase["default"].database().ref("screens/".concat(s.script_id, "/").concat(s.screen_id)).set(_objectSpread(_objectSpread({}, s.data), {}, {
          screenId: s.screen_id,
          scriptId: s.script_id,
          createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
          updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
        }));
      })), (0, _toConsumableArray2["default"])(diagnoses.map(function (_ref5) {
        var id = _ref5.id,
            s = (0, _objectWithoutProperties2["default"])(_ref5, ["id"]);
        return _firebase["default"].database().ref("diagnosis/".concat(s.script_id, "/").concat(s.diagnosis_id)).set(_objectSpread(_objectSpread({}, s.data), {}, {
          diagnosisId: s.diagnosis_id,
          scriptId: s.script_id,
          createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
          updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
        }));
      })), (0, _toConsumableArray2["default"])(configKeys.map(function (_ref6) {
        var configKeyId = _ref6.id,
            s = (0, _objectWithoutProperties2["default"])(_ref6, ["id"]);
        return _firebase["default"].database().ref("configkeys/".concat(configKeyId)).set(_objectSpread(_objectSpread({}, s.data), {}, {
          configKeyId: configKeyId,
          createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
          updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
        }));
      })))).then(function () {
        done(null, {
          success: true
        });
      })["catch"](done);
    })["catch"](done);
  };
};