"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../models");

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
      configKeys = JSON.parse(JSON.stringify(diagnoses));
      Promise.all([].concat((0, _toConsumableArray2["default"])(scripts.map(function (_ref3) {
        var id = _ref3.id,
            s = (0, _objectWithoutProperties2["default"])(_ref3, ["id"]);
        return _firebase["default"].database().ref("scripts/".concat(id)).set((0, _objectSpread2["default"])({}, s, {
          data: JSON.stringify(s.data)
        }));
      })), (0, _toConsumableArray2["default"])(screens.map(function (_ref4) {
        var id = _ref4.id,
            s = (0, _objectWithoutProperties2["default"])(_ref4, ["id"]);
        return _firebase["default"].database().ref("screens/".concat(s.screen_id)).set((0, _objectSpread2["default"])({}, s, {
          data: JSON.stringify(s.data)
        }));
      })), (0, _toConsumableArray2["default"])(diagnoses.map(function (_ref5) {
        var id = _ref5.id,
            s = (0, _objectWithoutProperties2["default"])(_ref5, ["id"]);
        return _firebase["default"].database().ref("diagnosis/".concat(id)).set((0, _objectSpread2["default"])({}, s, {
          data: JSON.stringify(s.data)
        }));
      })), (0, _toConsumableArray2["default"])(configKeys.map(function (_ref6) {
        var id = _ref6.id,
            s = (0, _objectWithoutProperties2["default"])(_ref6, ["id"]);
        return _firebase["default"].database().ref("configkeys/".concat(id)).set((0, _objectSpread2["default"])({}, s, {
          data: JSON.stringify(s.data)
        }));
      })))).then(function () {
        done(null, {
          success: true
        });
      })["catch"](done);
    })["catch"](done);
  };
};