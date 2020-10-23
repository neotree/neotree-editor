"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _index = require("../index");

var _models = require("../../database/models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var _default = function _default() {
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var authUsers, rslts, adminUser, users, seedUsers;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
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
              users = {};
              _context.prev = 25;
              _context.next = 28;
              return new Promise(function (resolve) {
                _index.firebaseAdmin.database().ref('users').once('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 28:
              users = _context.sent;
              users = users || {};
              _context.next = 35;
              break;

            case 32:
              _context.prev = 32;
              _context.t2 = _context["catch"](25);
              return _context.abrupt("return", reject(_context.t2));

            case 35:
              seedUsers = [];
              _context.prev = 36;
              seedUsers = authUsers.filter(function (u) {
                return !users[u.uid];
              }).map(function (u) {
                return {
                  email: u.email,
                  id: u.uid,
                  userId: u.uid,
                  hospitals: [],
                  countries: [],
                  activated: false
                };
              });
              _context.next = 40;
              return Promise.all(seedUsers.map(function (u) {
                return _index.firebaseAdmin.database().ref("users/".concat(u.userId)).set(u);
              }));

            case 40:
              _context.next = 45;
              break;

            case 42:
              _context.prev = 42;
              _context.t3 = _context["catch"](36);
              return _context.abrupt("return", reject(_context.t3));

            case 45:
              _context.prev = 45;
              _context.next = 48;
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

            case 48:
              _context.next = 53;
              break;

            case 50:
              _context.prev = 50;
              _context.t4 = _context["catch"](45);
              return _context.abrupt("return", reject(_context.t4));

            case 53:
              resolve();

            case 54:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 8], [14, 21], [25, 32], [36, 42], [45, 50]]);
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

  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/firebase/sync/syncUsers.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();