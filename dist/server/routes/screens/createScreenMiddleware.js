"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _database = require("../../database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _req$body, scriptId, payload, done, screenId, snap, screensCount, screen, rslts, _JSON$parse, data, s;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _req$body = req.body, scriptId = _req$body.scriptId, payload = (0, _objectWithoutProperties2["default"])(_req$body, ["scriptId"]);

              done = function done(err, screen) {
                res.locals.setResponse(err, {
                  screen: screen
                });
                next();
              };

              screenId = null;
              _context.prev = 3;
              _context.next = 6;
              return _firebase["default"].database().ref("screens/".concat(scriptId)).push();

            case 6:
              snap = _context.sent;
              screenId = snap.key;
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 13:
              screensCount = 0;
              _context.prev = 14;
              _context.next = 17;
              return _database.Screen.count({
                where: {
                  script_id: scriptId,
                  deletedAt: null
                }
              });

            case 17:
              screensCount = _context.sent;
              _context.next = 22;
              break;

            case 20:
              _context.prev = 20;
              _context.t1 = _context["catch"](14);

            case 22:
              screen = _objectSpread(_objectSpread({}, payload), {}, {
                screenId: screenId,
                scriptId: scriptId,
                position: screensCount + 1,
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              });
              _context.prev = 23;
              _context.next = 26;
              return _database.Screen.findOrCreate({
                where: {
                  screen_id: screen.screenId
                },
                defaults: {
                  script_id: scriptId,
                  screen_id: screen.screenId,
                  position: screen.position,
                  type: screen.type,
                  data: JSON.stringify(screen)
                }
              });

            case 26:
              rslts = _context.sent;

              if (rslts && rslts[0]) {
                _JSON$parse = JSON.parse(JSON.stringify(rslts[0])), data = _JSON$parse.data, s = (0, _objectWithoutProperties2["default"])(_JSON$parse, ["data"]);
                screen = _objectSpread(_objectSpread({}, data), s);
              }

              _context.next = 33;
              break;

            case 30:
              _context.prev = 30;
              _context.t2 = _context["catch"](23);
              return _context.abrupt("return", done(_context.t2));

            case 33:
              done(null, screen);

            case 34:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 10], [14, 20], [23, 30]]);
    }))();
  };
};