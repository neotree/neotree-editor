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
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var copyScreen = exports.copyScreen = function copyScreen(_ref) {
  var id = _ref.id;
  return new Promise(function (resolve, reject) {
    if (!id) return reject(new Error('Required screen "id" is not provided.'));
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var screenId, snap, screen, screensCount, savedScreen;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
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
            if (!(screen.type === 'diagnosis')) {
              _context.next = 18;
              break;
            }
            return _context.abrupt("return", reject(new Error('A script can only have one screen with type `diagnosis`')));
          case 18:
            _context.next = 22;
            break;
          case 20:
            _context.prev = 20;
            _context.t1 = _context["catch"](12);
          case 22:
            if (screen) {
              _context.next = 24;
              break;
            }
            return _context.abrupt("return", reject(new Error("Screen with id \"".concat(id, "\" not found"))));
          case 24:
            screen = JSON.parse(JSON.stringify(screen));
            screensCount = 0;
            _context.prev = 26;
            _context.next = 29;
            return _models.Screen.count({
              where: {}
            });
          case 29:
            screensCount = _context.sent;
            _context.next = 34;
            break;
          case 32:
            _context.prev = 32;
            _context.t2 = _context["catch"](26);
          case 34:
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
            _context.prev = 37;
            _context.next = 40;
            return _models.Screen.findOrCreate({
              where: {
                screen_id: screen.screen_id
              },
              defaults: _objectSpread({}, screen)
            });
          case 40:
            savedScreen = _context.sent;
            _context.next = 46;
            break;
          case 43:
            _context.prev = 43;
            _context.t3 = _context["catch"](37);
            return _context.abrupt("return", reject(_context.t3));
          case 46:
            resolve(savedScreen);
          case 47:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 8], [12, 20], [26, 32], [37, 43]]);
    }))();
  });
};
var _default = function _default() {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var screens, done, rslts;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            screens = req.body.screens;
            done = /*#__PURE__*/function () {
              var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(err) {
                var rslts,
                  _args2 = arguments;
                return _regenerator["default"].wrap(function _callee2$(_context2) {
                  while (1) switch (_context2.prev = _context2.next) {
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
      }, _callee3, null, [[3, 9]]);
    }))();
  };
};
var _default2 = exports["default"] = _default;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(copyScreen, "copyScreen", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/screens/duplicateScreensMiddleware.js");
  reactHotLoader.register(_default, "default", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/screens/duplicateScreensMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();