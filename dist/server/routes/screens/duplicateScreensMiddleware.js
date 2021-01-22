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
  var id = _ref.id;
  return new Promise(function (resolve, reject) {
    if (!id) return reject(new Error('Required screen "id" is not provided.'));
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var screenId, snap, screen, screensCount, savedScreen;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              screenId = null;
              _context.prev = 1;
              _context.next = 4;
              return _firebase["default"].database().ref('screens').push();

            case 4:
              snap = _context.sent;
              screenId = snap.key;
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](1);
              return _context.abrupt("return", reject(_context.t0));

            case 11:
              screen = null;
              _context.prev = 12;
              _context.next = 15;
              return _models.Screen.findOne({
                where: {
                  id: id
                }
              });

            case 15:
              screen = _context.sent;
              _context.next = 20;
              break;

            case 18:
              _context.prev = 18;
              _context.t1 = _context["catch"](12);

            case 20:
              if (screen) {
                _context.next = 22;
                break;
              }

              return _context.abrupt("return", reject(new Error("Screen with id \"".concat(id, "\" not found"))));

            case 22:
              screen = JSON.parse(JSON.stringify(screen));
              screensCount = 0;
              _context.prev = 24;
              _context.next = 27;
              return _models.Screen.count({
                where: {}
              });

            case 27:
              screensCount = _context.sent;
              _context.next = 32;
              break;

            case 30:
              _context.prev = 30;
              _context.t2 = _context["catch"](24);

            case 32:
              delete screen.id;
              screen = _objectSpread(_objectSpread({}, screen), {}, {
                screen_id: screenId,
                position: screensCount + 1,
                data: JSON.stringify(_objectSpread(_objectSpread({}, screen.data), {}, {
                  screenId: screenId,
                  position: screensCount + 1,
                  createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                  updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
                }))
              });
              savedScreen = null;
              _context.prev = 35;
              _context.next = 38;
              return _models.Screen.findOrCreate({
                where: {
                  screen_id: screen.screen_id
                },
                defaults: _objectSpread({}, screen)
              });

            case 38:
              savedScreen = _context.sent;
              _context.next = 44;
              break;

            case 41:
              _context.prev = 41;
              _context.t3 = _context["catch"](35);
              return _context.abrupt("return", reject(_context.t3));

            case 44:
              resolve(savedScreen);

            case 45:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 8], [12, 18], [24, 30], [35, 41]]);
    }))();
  });
};

exports.copyScreen = copyScreen;

var _default = function _default() {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var screens, done, rslts;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              screens = req.body.screens;

              done = /*#__PURE__*/function () {
                var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(err) {
                  var rslts,
                      _args2 = arguments;
                  return _regenerator["default"].wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          rslts = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : [];
                          res.locals.setResponse(err, {
                            screens: rslts
                          });
                          next();

                        case 3:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                }));

                return function done(_x) {
                  return _ref4.apply(this, arguments);
                };
              }();

              rslts = [];
              _context3.prev = 3;
              _context3.next = 6;
              return Promise.all(screens.map(function (s) {
                return copyScreen(s);
              }));

            case 6:
              rslts = _context3.sent;
              _context3.next = 12;
              break;

            case 9:
              _context3.prev = 9;
              _context3.t0 = _context3["catch"](3);
              return _context3.abrupt("return", done(_context3.t0));

            case 12:
              done(null, rslts);

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[3, 9]]);
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