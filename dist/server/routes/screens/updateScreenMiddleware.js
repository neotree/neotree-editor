"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateScreen = exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _models = require("../../database/models");
var _excluded = ["id"];
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var updateScreen = exports.updateScreen = function updateScreen(_ref) {
  var id = _ref.id,
    payload = (0, _objectWithoutProperties2["default"])(_ref, _excluded);
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var screen;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (id) {
              _context.next = 2;
              break;
            }
            return _context.abrupt("return", reject(new Error('Required screen "id" is not provided.')));
          case 2:
            screen = null;
            _context.prev = 3;
            _context.next = 6;
            return _models.Screen.findOne({
              where: {
                id: id
              }
            });
          case 6:
            screen = _context.sent;
            _context.next = 12;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](3);
            return _context.abrupt("return", reject(_context.t0));
          case 12:
            if (screen) {
              _context.next = 14;
              break;
            }
            return _context.abrupt("return", reject(new Error("Screen with id \"".concat(id, "\" not found"))));
          case 14:
            _context.prev = 14;
            _context.next = 17;
            return _models.Screen.update({
              position: payload.position || screen.position,
              data: JSON.stringify(_objectSpread(_objectSpread({}, screen.data), payload))
            }, {
              where: {
                id: id
              }
            });
          case 17:
            _context.next = 21;
            break;
          case 19:
            _context.prev = 19;
            _context.t1 = _context["catch"](14);
          case 21:
            resolve(screen);
          case 22:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[3, 9], [14, 19]]);
    }))();
  });
};
var _default = function _default() {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var done, screen;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            done = function done(err, screen) {
              res.locals.setResponse(err, {
                screen: screen
              });
              next();
            };
            screen = null;
            _context2.prev = 2;
            _context2.next = 5;
            return updateScreen(req.body);
          case 5:
            screen = _context2.sent;
            _context2.next = 11;
            break;
          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2["catch"](2);
            return _context2.abrupt("return", done(_context2.t0));
          case 11:
            done(null, screen);
          case 12:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[2, 8]]);
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
  reactHotLoader.register(updateScreen, "updateScreen", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/screens/updateScreenMiddleware.js");
  reactHotLoader.register(_default, "default", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/screens/updateScreenMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();