"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _index = require("../index");
var _models = require("../../database/models");
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var _default = function _default() {
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var authUsers, rslts, adminUser, countUsers, users, seedUsers;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            authUsers = [];
            _context.prev = 1;
            _context.next = 4;
            return _index.firebaseAdmin.auth().listUsers();
          case 4:
            rslts = _context.sent;
            authUsers = rslts.users || [];
            _context.next = 11;
            break;
          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            return _context.abrupt("return", reject(_context.t0));
          case 11:
            if (!process.env.DEFAULT_ADMIN_USER_EMAIL_ADDRESS) {
              _context.next = 24;
              break;
            }
            adminUser = authUsers.filter(function (u) {
              return u.email === process.env.DEFAULT_ADMIN_USER_EMAIL_ADDRESS;
            })[0];
            if (adminUser) {
              _context.next = 24;
              break;
            }
            _context.prev = 14;
            _context.next = 17;
            return _index.firebaseAdmin.auth().createUser({
              email: process.env.DEFAULT_ADMIN_USER_EMAIL_ADDRESS,
              password: process.env.DEFAULT_ADMIN_USER_PASSWORD
            });
          case 17:
            adminUser = _context.sent;
            authUsers.push(adminUser);
            _context.next = 24;
            break;
          case 21:
            _context.prev = 21;
            _context.t1 = _context["catch"](14);
            return _context.abrupt("return", reject(_context.t1));
          case 24:
            countUsers = 0;
            _context.prev = 25;
            _context.next = 28;
            return _models.User.count({
              where: {}
            });
          case 28:
            countUsers = _context.sent;
            _context.next = 33;
            break;
          case 31:
            _context.prev = 31;
            _context.t2 = _context["catch"](25);
          case 33:
            if (countUsers) {
              _context.next = 63;
              break;
            }
            users = {};
            _context.prev = 35;
            _context.next = 38;
            return new Promise(function (resolve) {
              _index.firebaseAdmin.database().ref('users').once('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 38:
            users = _context.sent;
            users = users || {};
            _context.next = 45;
            break;
          case 42:
            _context.prev = 42;
            _context.t3 = _context["catch"](35);
            return _context.abrupt("return", reject(_context.t3));
          case 45:
            seedUsers = [];
            _context.prev = 46;
            seedUsers = authUsers.map(function (u) {
              return {
                email: u.email,
                id: u.uid,
                userId: u.uid,
                hospitals: [],
                countries: [],
                activated: false
              };
            });
            _context.next = 50;
            return Promise.all(seedUsers.map(function (u) {
              return _index.firebaseAdmin.database().ref("users/".concat(u.userId)).set(_objectSpread(_objectSpread({}, u), users[u.id]));
            }));
          case 50:
            _context.next = 55;
            break;
          case 52:
            _context.prev = 52;
            _context.t4 = _context["catch"](46);
            return _context.abrupt("return", reject(_context.t4));
          case 55:
            _context.prev = 55;
            _context.next = 58;
            return Promise.all(seedUsers.map(function (u) {
              return _models.User.findOrCreate({
                where: {
                  email: u.email
                },
                defaults: {
                  user_id: u.userId,
                  email: u.email,
                  data: JSON.stringify(u)
                }
              });
            }));
          case 58:
            _context.next = 63;
            break;
          case 60:
            _context.prev = 60;
            _context.t5 = _context["catch"](55);
            return _context.abrupt("return", reject(_context.t5));
          case 63:
            resolve();
          case 64:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 8], [14, 21], [25, 31], [35, 42], [46, 52], [55, 60]]);
    }))();
  });
};
var _default2 = _default;
exports["default"] = _default2;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(_default, "default", "/home/farai/Workbench/neotree-editor/server/firebase/sync/syncUsers.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();