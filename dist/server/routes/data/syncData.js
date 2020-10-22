"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _sequelize = require("sequelize");

var _database = require("../../database");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = req.query;
    var lastSyncDate = payload.lastSyncDate ? new Date(payload.lastSyncDate).getTime() : null;

    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };

    Promise.all([!lastSyncDate ? null : _database.Log.findAll({
      where: {
        createdAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate),
        name: (0, _defineProperty2["default"])({}, _sequelize.Op.or, ['delete_scripts', 'delete_screens', 'delete_daignoses', 'deleteconfig_keys'])
      }
    }), _database.Script.findAll({
      where: !lastSyncDate ? {} : {
        updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
      }
    }), _database.Script.findAll({
      where: !lastSyncDate ? {} : {
        createdAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
      }
    }), _database.Screen.findAll({
      where: !lastSyncDate ? {} : {
        updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
      }
    }), _database.Screen.findAll({
      where: !lastSyncDate ? {} : {
        createdAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
      }
    }), _database.Diagnosis.findAll({
      where: !lastSyncDate ? {} : {
        updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
      }
    }), _database.Diagnosis.findAll({
      where: !lastSyncDate ? {} : {
        createdAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
      }
    }), _database.ConfigKey.findAll({
      where: !lastSyncDate ? {} : {
        updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
      }
    }), _database.ConfigKey.findAll({
      where: !lastSyncDate ? {} : {
        createdAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
      }
    })]).then(function () {
      var rslts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      done(null, {
        scripts: {
          lastCreated: rslts[1] || [],
          lastUpdated: rslts[2] || [],
          lastDeleted: !lastSyncDate ? [] : (rslts[0] || []).filter(function (log) {
            return log.name === 'delete_scripts';
          }).reduce(function (acc, log) {
            return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])((log.data.scripts || []).map(function (s) {
              return {
                id: s.id
              };
            })));
          }, [])
        },
        screens: {
          lastCreated: rslts[3] || [],
          lastUpdated: rslts[4] || [],
          lastDeleted: (rslts[0] || []).filter(function (log) {
            return log.name === 'delete_screens';
          }).reduce(function (acc, log) {
            return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])((log.data.screens || []).map(function (s) {
              return {
                id: s.id
              };
            })));
          }, [])
        },
        diagnoses: {
          lastCreated: rslts[5] || [],
          lastUpdated: rslts[6] || [],
          lastDeleted: !lastSyncDate ? [] : (rslts[0] || []).filter(function (log) {
            return log.name === 'delete_diagnoses';
          }).reduce(function (acc, log) {
            return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])((log.data.diagnoses || []).map(function (s) {
              return {
                id: s.id
              };
            })));
          }, [])
        },
        config_keys: {
          lastCreated: rslts[7] || [],
          lastUpdated: rslts[8] || [],
          lastDeleted: !lastSyncDate ? [] : (rslts[0] || []).filter(function (log) {
            return log.name === 'deleteconfig_keys';
          }).reduce(function (acc, log) {
            return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])((log.data.config_keys || []).map(function (s) {
              return {
                id: s.id
              };
            })));
          }, [])
        }
      });
    })["catch"](done);
  };
};