"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _req$body, items, scriptId, done, ids, snaps, screens, _screens;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _req$body = req.body, items = _req$body.items, scriptId = _req$body.targetScriptId;

              done = function done(err) {
                var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                if (items.length) app.io.emit('create_screens', {
                  key: app.getRandomString(),
                  screens: items.map(function (s) {
                    return {
                      id: s.id,
                      scriptId: s.scriptId
                    };
                  })
                });
                res.locals.setResponse(err, {
                  items: items
                });
                next();
              };

              ids = [];
              _context.prev = 3;
              _context.next = 6;
              return Promise.all(items.map(function () {
                return _firebase["default"].database().ref("screens/".concat(scriptId)).push();
              }));

            case 6:
              snaps = _context.sent;
              snaps.forEach(function (snap) {
                return ids.push(snap.key);
              });
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 13:
              screens = [];
              _context.prev = 14;
              _context.next = 17;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("screens/".concat(scriptId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 17:
              _screens = _context.sent;
              _screens = _screens || {};
              screens = Object.keys(_screens).map(function (key) {
                return _screens[key];
              });
              screens = items.map(function (s, i) {
                return _objectSpread(_objectSpread(_objectSpread({}, s), _screens[s.screenId]), {}, {
                  scriptId: scriptId,
                  position: i + screens.length + 1,
                  id: ids[i] || s.id,
                  screenId: ids[i] || s.id
                });
              });
              _context.next = 26;
              break;

            case 23:
              _context.prev = 23;
              _context.t1 = _context["catch"](14);
              return _context.abrupt("return", done(_context.t1));

            case 26:
              _context.prev = 26;
              _context.next = 29;
              return Promise.all(screens.map(function (s) {
                return _firebase["default"].database().ref("screens/".concat(scriptId, "/").concat(s.screenId)).set(_objectSpread(_objectSpread({}, s), {}, {
                  createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                  updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
                }));
              }));

            case 29:
              _context.next = 34;
              break;

            case 31:
              _context.prev = 31;
              _context.t2 = _context["catch"](26);
              return _context.abrupt("return", done(_context.t2));

            case 34:
              done(null, screens);

            case 35:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 10], [14, 23], [26, 31]]);
    }))();
  };
};