"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _sequelize = require("sequelize");

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var _JSON$parse = JSON.parse(req.query.payload || '{}'),
        lastSyncDate = _JSON$parse.lastSyncDate,
        payload = (0, _objectWithoutProperties2["default"])(_JSON$parse, ["lastSyncDate"]);

    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };

    Promise.all([_models.Log.findAll({
      where: {
        createdAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, (lastSyncDate ? new Date(lastSyncDate) : new Date()).getTime()),
        name: (0, _defineProperty2["default"])({}, _sequelize.Op.or, ['delete_scripts', 'delete_screens', 'delete_daignoses', 'delete_config_keys'])
      }
    }), _models.Script.count({
      where: (0, _objectSpread2["default"])({}, payload.countScripts)
    }), _models.Script.findAll({
      where: (0, _objectSpread2["default"])({}, payload.lastCreatedScripts),
      attributes: ['createdAt'],
      limit: 1,
      order: [['createdAt', 'DESC']]
    }), _models.Script.findAll({
      where: (0, _objectSpread2["default"])({}, payload.lastUpdatedScripts),
      attributes: ['updatedAt'],
      limit: 1,
      order: [['updatedAt', 'DESC']]
    }), _models.Screen.count({
      where: (0, _objectSpread2["default"])({}, payload.countScreens)
    }), _models.Screen.findAll({
      where: (0, _objectSpread2["default"])({}, payload.lastCreatedScreens),
      attributes: ['createdAt'],
      limit: 1,
      order: [['createdAt', 'DESC']]
    }), _models.Screen.findAll({
      where: (0, _objectSpread2["default"])({}, payload.lastUpdatedScreens),
      attributes: ['updatedAt'],
      limit: 1,
      order: [['updatedAt', 'DESC']]
    }), _models.Diagnosis.count({
      where: (0, _objectSpread2["default"])({}, payload.countDiagnoses)
    }), _models.Diagnosis.findAll({
      where: (0, _objectSpread2["default"])({}, payload.lastCreatedDiagnoses),
      attributes: ['createdAt'],
      limit: 1,
      order: [['createdAt', 'DESC']]
    }), _models.Diagnosis.findAll({
      where: (0, _objectSpread2["default"])({}, payload.lastUpdatedDiagnoses),
      attributes: ['updatedAt'],
      limit: 1,
      order: [['updatedAt', 'DESC']]
    }), _models.ConfigKey.count({
      where: (0, _objectSpread2["default"])({}, payload.countConfigKeys)
    }), _models.ConfigKey.findAll({
      where: (0, _objectSpread2["default"])({}, payload.lastCreatedConfigKeys),
      attributes: ['createdAt'],
      limit: 1,
      order: [['createdAt', 'DESC']]
    }), _models.ConfigKey.findAll({
      where: (0, _objectSpread2["default"])({}, payload.lastUpdatedConfigKeys),
      attributes: ['updatedAt'],
      limit: 1,
      order: [['updatedAt', 'DESC']]
    })]).then(function () {
      var rslts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      done(null, {
        scripts: {
          count: rslts[1],
          lastCreatedDate: rslts[2] && rslts[2][0] ? rslts[2][0].createdAt : null,
          lastUpdatedDate: rslts[3] && rslts[3][0] ? rslts[3][0].updatedAt : null,
          lastDeleted: (rslts[0] || []).filter(function (log) {
            return log.name === 'delete_scripts';
          }).reduce(function (acc, log) {
            return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])((log.data.scripts || []).map(function (s) {
              return s.id;
            })));
          }, [])
        },
        screens: {
          count: rslts[4],
          lastCreatedDate: rslts[5] && rslts[5][0] ? rslts[5][0].createdAt : null,
          lastUpdatedDate: rslts[6] && rslts[6][0] ? rslts[6][0].updatedAt : null,
          lastDeleted: (rslts[0] || []).filter(function (log) {
            return log.name === 'delete_screens';
          }).reduce(function (acc, log) {
            return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])((log.data.screens || []).map(function (s) {
              return s.id;
            })));
          }, [])
        },
        diagnoses: {
          count: rslts[7],
          lastCreatedDate: rslts[8] && rslts[8][0] ? rslts[8][0].createdAt : null,
          lastUpdatedDate: rslts[9] && rslts[9][0] ? rslts[9][0].updatedAt : null,
          lastDeleted: (rslts[0] || []).filter(function (log) {
            return log.name === 'delete_diagnoses';
          }).reduce(function (acc, log) {
            return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])((log.data.diagnoses || []).map(function (s) {
              return s.id;
            })));
          }, [])
        },
        config_keys: {
          count: rslts[10],
          lastCreatedDate: rslts[11] && rslts[11][0] ? rslts[11][0].createdAt : null,
          lastUpdatedDate: rslts[12] && rslts[12][0] ? rslts[12][0].updatedAt : null,
          lastDeleted: (rslts[0] || []).filter(function (log) {
            return log.name === 'delete_config_keys';
          }).reduce(function (acc, log) {
            return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])((log.data.config_keys || []).map(function (s) {
              return s.id;
            })));
          }, [])
        }
      });
    })["catch"](done);
  };
};