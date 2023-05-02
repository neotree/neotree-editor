"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _firebase = _interopRequireDefault(require("../../firebase"));
var _models = require("../../database/models");
var _excluded = ["id", "createdAt", "updatedAt", "data"],
  _excluded2 = ["data"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _req$body, items, scriptId, done, snaps, screensCount, canAddDiagnosisScreen, countDiagnosisScreens, screens, rslts;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _req$body = req.body, items = _req$body.items, scriptId = _req$body.targetScriptId;
            done = function done(err) {
              var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
              res.locals.setResponse(err, {
                items: items
              });
              next();
            };
            snaps = [];
            _context.prev = 3;
            _context.next = 6;
            return Promise.all(items.map(function () {
              return _firebase["default"].database().ref("screens/".concat(scriptId)).push();
            }));
          case 6:
            snaps = _context.sent;
            _context.next = 12;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", done(_context.t0));
          case 12:
            screensCount = 0;
            canAddDiagnosisScreen = true;
            _context.prev = 14;
            _context.next = 17;
            return _models.Screen.count({
              where: {
                script_id: scriptId,
                deletedAt: null
              }
            });
          case 17:
            screensCount = _context.sent;
            _context.next = 20;
            return _models.Screen.count({
              where: {
                type: 'diagnosis',
                script_id: scriptId
              }
            });
          case 20:
            countDiagnosisScreens = _context.sent;
            canAddDiagnosisScreen = !countDiagnosisScreens;
            _context.next = 26;
            break;
          case 24:
            _context.prev = 24;
            _context.t1 = _context["catch"](14);
          case 26:
            screens = [];
            _context.prev = 27;
            _context.next = 30;
            return _models.Screen.findAll({
              where: {
                id: items.map(function (s) {
                  return s.id;
                })
              }
            });
          case 30:
            screens = _context.sent;
            screens = screens.filter(function (s) {
              return s.type === 'diagnosis' ? canAddDiagnosisScreen : true;
            }).map(function (screen, i) {
              var _JSON$parse = JSON.parse(JSON.stringify(screen)),
                id = _JSON$parse.id,
                createdAt = _JSON$parse.createdAt,
                updatedAt = _JSON$parse.updatedAt,
                data = _JSON$parse.data,
                s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded); // eslint-disable-line
              return _objectSpread(_objectSpread({}, s), {}, {
                screen_id: snaps[i].key,
                script_id: scriptId,
                position: screensCount + 1,
                data: JSON.stringify(_objectSpread(_objectSpread({}, data), {}, {
                  scriptId: scriptId,
                  script_id: scriptId,
                  screen_id: snaps[i].key,
                  screenId: snaps[i].key,
                  position: screensCount + 1,
                  createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                  updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
                }))
              });
            });
            _context.next = 37;
            break;
          case 34:
            _context.prev = 34;
            _context.t2 = _context["catch"](27);
            return _context.abrupt("return", done(_context.t2));
          case 37:
            _context.prev = 37;
            _context.next = 40;
            return Promise.all(screens.map(function (screen) {
              return _models.Screen.findOrCreate({
                where: {
                  screen_id: screen.screen_id
                },
                defaults: _objectSpread(_objectSpread({}, screen), {}, {
                  createdAt: new Date(),
                  updatedAt: new Date()
                })
              });
            }));
          case 40:
            rslts = _context.sent;
            screens = rslts.map(function (rslt) {
              var _JSON$parse2 = JSON.parse(JSON.stringify(rslt[0])),
                data = _JSON$parse2.data,
                screen = (0, _objectWithoutProperties2["default"])(_JSON$parse2, _excluded2);
              return _objectSpread(_objectSpread({}, data), screen);
            });
            _context.next = 46;
            break;
          case 44:
            _context.prev = 44;
            _context.t3 = _context["catch"](37);
          case 46:
            done(null, screens);
          case 47:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 9], [14, 24], [27, 34], [37, 44]]);
    }))();
  };
};