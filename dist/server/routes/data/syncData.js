"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _sequelize = require("sequelize");

var _database = require("../../database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _req$query, _lastSyncDate, deviceId, scriptsCount, lastSyncDate, done, device, details, whereLastSyncDateGreaterThanLastUpdated, whereLastSyncDateGreaterThanLastDeleted;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _req$query = req.query, _lastSyncDate = _req$query.lastSyncDate, deviceId = _req$query.deviceId, scriptsCount = _req$query.scriptsCount;
              lastSyncDate = _lastSyncDate ? new Date(_lastSyncDate).getTime() : null;

              done = function done(e, payload) {
                res.locals.setResponse(e, payload);
                next();
              };

              device = null;

              if (!deviceId) {
                _context.next = 30;
                break;
              }

              _context.prev = 5;
              _context.next = 8;
              return _database.Device.findOne({
                where: {
                  device_id: deviceId
                }
              });

            case 8:
              device = _context.sent;
              _context.next = 13;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](5);

            case 13:
              if (!(device && scriptsCount && scriptsCount !== device.details.scripts_count)) {
                _context.next = 30;
                break;
              }

              details = JSON.stringify(_objectSpread(_objectSpread({}, device.details), {}, {
                scripts_count: scriptsCount
              }));
              _context.prev = 15;
              _context.next = 18;
              return _database.Device.update({
                details: details
              }, {
                where: {
                  device_id: deviceId
                }
              });

            case 18:
              _context.next = 22;
              break;

            case 20:
              _context.prev = 20;
              _context.t1 = _context["catch"](15);

            case 22:
              _context.prev = 22;
              _context.next = 25;
              return _database.Device.findOne({
                where: {
                  device_id: deviceId
                }
              });

            case 25:
              device = _context.sent;
              _context.next = 30;
              break;

            case 28:
              _context.prev = 28;
              _context.t2 = _context["catch"](22);

            case 30:
              whereLastSyncDateGreaterThanLastUpdated = !lastSyncDate ? {} : {
                updatedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
              };
              whereLastSyncDateGreaterThanLastDeleted = !lastSyncDate ? {} : {
                deletedAt: (0, _defineProperty2["default"])({}, _sequelize.Op.gte, lastSyncDate)
              };
              Promise.all([_database.Script.findAll({
                where: _objectSpread({
                  deletedAt: null
                }, whereLastSyncDateGreaterThanLastUpdated)
              }), _database.Script.findAll({
                where: _objectSpread({}, whereLastSyncDateGreaterThanLastDeleted)
              }), _database.Screen.findAll({
                where: _objectSpread({
                  deletedAt: null
                }, whereLastSyncDateGreaterThanLastUpdated)
              }), _database.Screen.findAll({
                where: _objectSpread({}, whereLastSyncDateGreaterThanLastDeleted)
              }), _database.Diagnosis.findAll({
                where: _objectSpread({
                  deletedAt: null
                }, whereLastSyncDateGreaterThanLastUpdated)
              }), _database.Diagnosis.findAll({
                where: _objectSpread({}, whereLastSyncDateGreaterThanLastDeleted)
              }), _database.ConfigKey.findAll({
                where: _objectSpread({
                  deletedAt: null
                }, whereLastSyncDateGreaterThanLastUpdated)
              }), _database.ConfigKey.findAll({
                where: _objectSpread({}, whereLastSyncDateGreaterThanLastDeleted)
              })]).then(function (_ref2) {
                var _ref3 = (0, _slicedToArray2["default"])(_ref2, 8),
                    scripts = _ref3[0],
                    deletedScripts = _ref3[1],
                    screens = _ref3[2],
                    deletedScreens = _ref3[3],
                    diagnoses = _ref3[4],
                    deletedDiagnoses = _ref3[5],
                    configKeys = _ref3[6],
                    deletedConfigKeys = _ref3[7];

                done(null, {
                  device: device,
                  scripts: scripts,
                  deletedScripts: deletedScripts,
                  screens: screens,
                  deletedScreens: deletedScreens,
                  diagnoses: diagnoses,
                  deletedDiagnoses: deletedDiagnoses,
                  configKeys: configKeys,
                  deletedConfigKeys: deletedConfigKeys
                });
              })["catch"](done);

            case 33:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 11], [15, 20], [22, 28]]);
    }))();
  };
};