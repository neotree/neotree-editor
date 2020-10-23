"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyScreen = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../database/models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var copyScreen = function copyScreen(_ref) {
  var scriptId = _ref.scriptId,
      id = _ref.screenId;
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var screenId, snap, screen, screens;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (scriptId) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", reject(new Error('Required script "id" is not provided.')));

            case 2:
              if (id) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", reject(new Error('Required screen "id" is not provided.')));

            case 4:
              screenId = null;
              _context.prev = 5;
              _context.next = 8;
              return _firebase["default"].database().ref('screens').push();

            case 8:
              snap = _context.sent;
              screenId = snap.key;
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](5);
              return _context.abrupt("return", reject(_context.t0));

            case 15:
              screen = null;
              _context.prev = 16;
              _context.next = 19;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("screens/".concat(scriptId, "/").concat(id)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 19:
              screen = _context.sent;
              _context.next = 24;
              break;

            case 22:
              _context.prev = 22;
              _context.t1 = _context["catch"](16);

            case 24:
              if (screen) {
                _context.next = 26;
                break;
              }

              return _context.abrupt("return", reject(new Error("Screen with id \"".concat(id, "\" not found"))));

            case 26:
              screens = {};
              _context.prev = 27;
              _context.next = 30;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("screens/".concat(scriptId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 30:
              screens = _context.sent;
              screens = screens || {};
              _context.next = 36;
              break;

            case 34:
              _context.prev = 34;
              _context.t2 = _context["catch"](27);

            case 36:
              screen = _objectSpread(_objectSpread({}, screen), {}, {
                screenId: screenId,
                id: screenId,
                position: Object.keys(screens).length + 1,
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              });
              _context.prev = 37;
              _context.next = 40;
              return _firebase["default"].database().ref("screens/".concat(scriptId, "/").concat(screenId)).set(screen);

            case 40:
              _context.next = 45;
              break;

            case 42:
              _context.prev = 42;
              _context.t3 = _context["catch"](37);
              return _context.abrupt("return", reject(_context.t3));

            case 45:
              _context.prev = 45;
              _context.next = 48;
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

            case 48:
              _context.next = 52;
              break;

            case 50:
              _context.prev = 50;
              _context.t4 = _context["catch"](45);

            case 52:
              resolve(screen);

            case 53:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 12], [16, 22], [27, 34], [37, 42], [45, 50]]);
    }))();
  });
};

exports.copyScreen = copyScreen;

var _default = function _default(app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var screens, done, _screens;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              screens = req.body.screens;

              done = function done(err) {
                var _screens = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

                if (_screens.length) {
                  app.io.emit('create_screens', {
                    key: app.getRandomString(),
                    screens: screens
                  });

                  _models.Log.create({
                    name: 'create_screens',
                    data: JSON.stringify({
                      screens: screens
                    })
                  });
                }

                res.locals.setResponse(err, {
                  screens: _screens
                });
                next();
              };

              _screens = [];
              _context2.prev = 3;
              _context2.next = 6;
              return Promise.all(screens.map(function (s) {
                return copyScreen(s);
              }));

            case 6:
              _screens = _context2.sent;
              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](3);
              return _context2.abrupt("return", done(_context2.t0));

            case 12:
              done(null, _screens);

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[3, 9]]);
    }))();
  };
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(copyScreen, "copyScreen", "/home/farai/WorkBench/neotree-editor/server/routes/screens/duplicateScreensMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/routes/screens/duplicateScreensMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();