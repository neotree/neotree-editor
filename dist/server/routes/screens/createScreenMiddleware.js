"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../database/models");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _req$body, scriptId, payload, done, screenId, snap, screens, screen;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _req$body = req.body, scriptId = _req$body.scriptId, payload = (0, _objectWithoutProperties2["default"])(_req$body, ["scriptId"]);

              done = function done(err, screen) {
                if (screen) {
                  app.io.emit('create_screens', {
                    key: app.getRandomString(),
                    screens: [{
                      screenId: screen.id,
                      scriptId: scriptId
                    }]
                  });

                  _models.Log.create({
                    name: 'create_screens',
                    data: JSON.stringify({
                      screens: [{
                        screenId: screen.id,
                        scriptId: scriptId
                      }]
                    })
                  });
                }

                res.locals.setResponse(err, {
                  screen: screen
                });
                next();
              };

              if (scriptId) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", done(new Error('Required script "id" is not provided.')));

            case 4:
              screenId = null;
              _context.prev = 5;
              _context.next = 8;
              return _firebase["default"].database().ref("screens/".concat(scriptId)).push();

            case 8:
              snap = _context.sent;
              screenId = snap.key;
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](5);
              return _context.abrupt("return", done(_context.t0));

            case 15:
              screens = {};
              _context.prev = 16;
              _context.next = 19;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("screens/".concat(scriptId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 19:
              screens = _context.sent;
              screens = screens || {};
              _context.next = 25;
              break;

            case 23:
              _context.prev = 23;
              _context.t1 = _context["catch"](16);

            case 25:
              screen = _objectSpread(_objectSpread({}, payload), {}, {
                scriptId: scriptId,
                screenId: screenId,
                id: screenId,
                position: Object.keys(screens).length + 1,
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              });
              _context.prev = 26;
              _context.next = 29;
              return _firebase["default"].database().ref("screens/".concat(scriptId, "/").concat(screenId)).set(screen);

            case 29:
              _context.next = 34;
              break;

            case 31:
              _context.prev = 31;
              _context.t2 = _context["catch"](26);
              return _context.abrupt("return", done(_context.t2));

            case 34:
              _context.prev = 34;
              _context.next = 37;
              return _models.Screen.findOrCreate({
                where: {
                  screen_id: screen.screenId
                },
                defaults: {
                  screen_id: screen.screenId,
                  script_id: screen.scriptId,
                  type: screen.type,
                  position: screen.position,
                  data: JSON.stringify(screen)
                }
              });

            case 37:
              _context.next = 41;
              break;

            case 39:
              _context.prev = 39;
              _context.t3 = _context["catch"](34);

            case 41:
              done(null, screen);

            case 42:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 12], [16, 23], [26, 31], [34, 39]]);
    }))();
  };
};