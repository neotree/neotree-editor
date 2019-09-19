"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res) {
    Promise.all([_models.ConfigKey.findAll({}), _models.Script.findAll({}), _models.Screen.findAll({}), _models.Diagnosis.findAll({})]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 4),
          cKeys = _ref2[0],
          scripts = _ref2[1],
          screens = _ref2[2],
          diagnoses = _ref2[3];

      var promises = [];
      cKeys.forEach(function (item) {
        return promises.push(_models.ConfigKey.update({
          updatedAt: new Date()
        }, {
          where: {
            id: item.id
          },
          individualHooks: true
        }));
      });
      scripts.forEach(function (item) {
        return promises.push(_models.Script.update({
          updatedAt: new Date()
        }, {
          where: {
            id: item.id
          },
          individualHooks: true
        }));
      });
      screens.forEach(function (item) {
        return promises.push(_models.Screen.update({
          updatedAt: new Date()
        }, {
          where: {
            id: item.id
          },
          individualHooks: true
        }));
      });
      diagnoses.forEach(function (item) {
        return promises.push(_models.Diagnosis.update({
          updatedAt: new Date()
        }, {
          where: {
            id: item.id
          },
          individualHooks: true
        }));
      });
      Promise.all(promises).then(function () {
        return res.json({
          status: 'OK'
        });
      })["catch"](function (error) {
        return res.json({
          error: error
        });
      });
    })["catch"](function (error) {
      return res.json({
        error: error
      });
    });
  };
};