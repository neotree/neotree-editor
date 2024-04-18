"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.addUser = void 0;
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _firebase = _interopRequireDefault(require("../../firebase"));
var _models = require("../../database/models");
var _excluded = ["email"];
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var addUser = exports.addUser = function addUser(params) {
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var email, userId, user;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            email = params.email, userId = params.userId;
            if (email) {
              _context.next = 3;
              break;
            }
            return _context.abrupt("return", reject(new Error('Required user "email" is not provided.')));
          case 3:
            user = null;
            if (!userId) {
              _context.next = 16;
              break;
            }
            _context.prev = 5;
            _context.next = 8;
            return _firebase["default"].auth().getUser(userId);
          case 8:
            user = _context.sent;
            _context.next = 14;
            break;
          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](5);
            return _context.abrupt("return", reject(_context.t0));
          case 14:
            _context.next = 25;
            break;
          case 16:
            _context.prev = 16;
            _context.next = 19;
            return _firebase["default"].auth().createUser(params);
          case 19:
            user = _context.sent;
            _context.next = 25;
            break;
          case 22:
            _context.prev = 22;
            _context.t1 = _context["catch"](16);
            return _context.abrupt("return", reject(_context.t1));
          case 25:
            if (!user) {
              _context.next = 43;
              break;
            }
            _context.prev = 26;
            _context.next = 29;
            return _firebase["default"].database().ref("users/".concat(user.uid)).set(_objectSpread({
              email: email,
              id: user.uid,
              userId: user.uid,
              hospitals: [],
              countries: [],
              activated: false
            }, params));
          case 29:
            _context.next = 34;
            break;
          case 31:
            _context.prev = 31;
            _context.t2 = _context["catch"](26);
            return _context.abrupt("return", reject(_context.t2));
          case 34:
            _context.prev = 34;
            _context.next = 37;
            return new Promise(function (resolve) {
              _firebase["default"].database().ref("users/".concat(user.uid)).on('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 37:
            user = _context.sent;
            _context.next = 43;
            break;
          case 40:
            _context.prev = 40;
            _context.t3 = _context["catch"](34);
            return _context.abrupt("return", reject(_context.t3));
          case 43:
            resolve(user);
          case 44:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[5, 11], [16, 22], [26, 31], [34, 40]]);
    }))();
  });
};
var _default = function _default() {
  return function (req, res, next) {
    var _req$body = req.body,
      email = _req$body.email,
      params = (0, _objectWithoutProperties2["default"])(_req$body, _excluded);
    var done = function done(err, user) {
      res.locals.setResponse(err, {
        user: user
      });
      next();
    };
    if (!email) return done({
      msg: 'Required user "email" is not provided.'
    });
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var user, _user;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            user = null;
            _context2.prev = 1;
            _context2.next = 4;
            return _firebase["default"].auth().createUser(_objectSpread({
              email: email
            }, params));
          case 4:
            user = _context2.sent;
            _context2.next = 10;
            break;
          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](1);
            return _context2.abrupt("return", done(_context2.t0));
          case 10:
            if (!user) {
              _context2.next = 36;
              break;
            }
            _user = _objectSpread({
              email: email,
              id: user.uid,
              userId: user.uid,
              hospitals: [],
              countries: [],
              activated: false
            }, params);
            _context2.prev = 12;
            _context2.next = 15;
            return _firebase["default"].database().ref("users/".concat(user.uid)).set(_user);
          case 15:
            _context2.next = 20;
            break;
          case 17:
            _context2.prev = 17;
            _context2.t1 = _context2["catch"](12);
            return _context2.abrupt("return", done(_context2.t1));
          case 20:
            _context2.prev = 20;
            _context2.next = 23;
            return new Promise(function (resolve) {
              _firebase["default"].database().ref("users/".concat(user.uid)).on('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 23:
            user = _context2.sent;
            _context2.next = 29;
            break;
          case 26:
            _context2.prev = 26;
            _context2.t2 = _context2["catch"](20);
            return _context2.abrupt("return", done(_context2.t2));
          case 29:
            _context2.prev = 29;
            _context2.next = 32;
            return _models.User.findOrCreate({
              where: {
                email: _user.email
              },
              defaults: {
                user_id: _user.userId,
                email: _user.email,
                data: JSON.stringify(_user)
              }
            });
          case 32:
            _context2.next = 36;
            break;
          case 34:
            _context2.prev = 34;
            _context2.t3 = _context2["catch"](29);
          case 36:
            done(null, user);
          case 37:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[1, 7], [12, 17], [20, 26], [29, 34]]);
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
  reactHotLoader.register(addUser, "addUser", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/users/_addUserMiddleware.js");
  reactHotLoader.register(_default, "default", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/users/_addUserMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();