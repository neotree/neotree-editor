"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _firebase = _interopRequireDefault(require("../../firebase"));
var _database = require("../../database");
var _excluded = ["id"],
  _excluded2 = ["id"],
  _excluded3 = ["id"],
  _excluded4 = ["id"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    var done = function done(err, rslts) {
      res.locals.setResponse(err, rslts);
      next();
      return null;
    };
    Promise.all([_database.Script.findAll({
      where: {}
    }), _database.Screen.findAll({
      where: {}
    }), _database.Diagnosis.findAll({
      where: {}
    }), _database.ConfigKey.findAll({
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
          s = (0, _objectWithoutProperties2["default"])(_ref3, _excluded);
        return _firebase["default"].database().ref("scripts/".concat(scriptId)).set(_objectSpread(_objectSpread({}, s.data), {}, {
          scriptId: scriptId,
          createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
          updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
        }));
      })), (0, _toConsumableArray2["default"])(screens.map(function (_ref4) {
        var id = _ref4.id,
          s = (0, _objectWithoutProperties2["default"])(_ref4, _excluded2);
        return _firebase["default"].database().ref("screens/".concat(s.script_id, "/").concat(s.screen_id)).set(_objectSpread(_objectSpread({}, s.data), {}, {
          screenId: s.screen_id,
          scriptId: s.script_id,
          createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
          updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
        }));
      })), (0, _toConsumableArray2["default"])(diagnoses.map(function (_ref5) {
        var id = _ref5.id,
          s = (0, _objectWithoutProperties2["default"])(_ref5, _excluded3);
        return _firebase["default"].database().ref("diagnosis/".concat(s.script_id, "/").concat(s.diagnosis_id)).set(_objectSpread(_objectSpread({}, s.data), {}, {
          diagnosisId: s.diagnosis_id,
          scriptId: s.script_id,
          createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
          updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
        }));
      })), (0, _toConsumableArray2["default"])(configKeys.map(function (_ref6) {
        var configKeyId = _ref6.id,
          s = (0, _objectWithoutProperties2["default"])(_ref6, _excluded4);
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