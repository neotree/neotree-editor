"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _cryptoJs = _interopRequireDefault(require("crypto-js"));
var _database = require("../database");
var _firebase = _interopRequireDefault(require("../database/firebase"));
var _excluded = ["id", "username", "password"],
  _excluded2 = ["id"];
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var encryptPassword = function encryptPassword(password) {
  return new Promise(function (resolve, reject) {
    _bcryptjs["default"].genSalt(10, function (err, salt) {
      _bcryptjs["default"].hash(password, salt, function (err, hash) {
        if (err) return reject(err);
        resolve(hash);
      });
    });
  });
};
module.exports = function addOrUpdateUser(_ref) {
  var id = _ref.id,
    username = _ref.username,
    password = _ref.password,
    userParams = (0, _objectWithoutProperties2["default"])(_ref, _excluded);
  if (username) userParams.email = userParams.email || username;
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var updatedUser, countUsersWithEmail, user, newUser, _user, _id, u;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (!password) {
              _context.next = 10;
              break;
            }
            _context.prev = 1;
            _context.next = 4;
            return encryptPassword(password);
          case 4:
            userParams.password = _context.sent;
            _context.next = 10;
            break;
          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](1);
            return _context.abrupt("return", reject(_context.t0));
          case 10:
            if (!id) {
              _context.next = 30;
              break;
            }
            _context.prev = 11;
            _context.next = 14;
            return _database.User.update(userParams, {
              where: {
                id: id
              },
              individualHooks: true
            });
          case 14:
            _context.next = 19;
            break;
          case 16:
            _context.prev = 16;
            _context.t1 = _context["catch"](11);
            return _context.abrupt("return", reject(_context.t1));
          case 19:
            _context.prev = 19;
            _context.next = 22;
            return _database.User.findOne({
              where: {
                id: id
              }
            });
          case 22:
            updatedUser = _context.sent;
            resolve(updatedUser);
            _context.next = 29;
            break;
          case 26:
            _context.prev = 26;
            _context.t2 = _context["catch"](19);
            return _context.abrupt("return", reject(_context.t2));
          case 29:
            return _context.abrupt("return");
          case 30:
            if (!userParams.email) {
              _context.next = 44;
              break;
            }
            _context.prev = 31;
            _context.next = 34;
            return _database.User.count({
              where: {
                email: userParams.email
              }
            });
          case 34:
            countUsersWithEmail = _context.sent;
            if (!countUsersWithEmail) {
              _context.next = 37;
              break;
            }
            return _context.abrupt("return", reject({
              msg: 'Username is taken.'
            }));
          case 37:
            _context.next = 42;
            break;
          case 39:
            _context.prev = 39;
            _context.t3 = _context["catch"](31);
            return _context.abrupt("return", reject(_context.t3));
          case 42:
            _context.next = 45;
            break;
          case 44:
            return _context.abrupt("return", reject({
              msg: 'Username is required.'
            }));
          case 45:
            user = null;
            _context.prev = 46;
            _context.next = 49;
            return _database.User.create(_objectSpread(_objectSpread({}, userParams), {}, {
              email_hash: _cryptoJs["default"].MD5(userParams.email).toString(),
              role: userParams.role || 0
            }));
          case 49:
            newUser = _context.sent;
            user = JSON.parse(JSON.stringify(newUser));
            _context.next = 56;
            break;
          case 53:
            _context.prev = 53;
            _context.t4 = _context["catch"](46);
            return _context.abrupt("return", reject(_context.t4));
          case 56:
            _context.prev = 56;
            _user = user, _id = _user.id, u = (0, _objectWithoutProperties2["default"])(_user, _excluded2); // eslint-disable-line
            _context.next = 60;
            return _firebase["default"].database().ref("users/".concat(user.email_hash)).set(u);
          case 60:
            resolve(user);
            _context.next = 66;
            break;
          case 63:
            _context.prev = 63;
            _context.t5 = _context["catch"](56);
            reject(_context.t5);
          case 66:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 7], [11, 16], [19, 26], [31, 39], [46, 53], [56, 63]]);
    }))();
  });
};
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(encryptPassword, "encryptPassword", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/utils/addOrUpdateUser.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();