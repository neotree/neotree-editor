"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../database/models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var deleteUser = function deleteUser(userId) {
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var user;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (userId) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", reject(new Error('Required user "id" is not provided.')));

            case 2:
              user = null;
              _context.prev = 3;
              _context.next = 6;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("users/".concat(userId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 6:
              user = _context.sent;
              _context.next = 11;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);

            case 11:
              if (user) {
                _context.next = 13;
                break;
              }

              return _context.abrupt("return", reject('User not found'));

            case 13:
              _context.prev = 13;
              _context.next = 16;
              return _firebase["default"].auth().deleteUser(userId);

            case 16:
              _context.next = 21;
              break;

            case 18:
              _context.prev = 18;
              _context.t1 = _context["catch"](13);
              return _context.abrupt("return", reject(_context.t1));

            case 21:
              _context.prev = 21;
              _context.next = 24;
              return _firebase["default"].database().ref("users/".concat(userId)).remove();

            case 24:
              _context.next = 29;
              break;

            case 26:
              _context.prev = 26;
              _context.t2 = _context["catch"](21);
              return _context.abrupt("return", reject(_context.t2));

            case 29:
              _context.prev = 29;
              _context.next = 32;
              return _models.User.destroy({
                where: {
                  user_id: userId
                }
              });

            case 32:
              _context.next = 36;
              break;

            case 34:
              _context.prev = 34;
              _context.t3 = _context["catch"](29);

            case 36:
              resolve(user);

            case 37:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9], [13, 18], [21, 26], [29, 34]]);
    }))();
  });
};

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var users, done, deletedUsers;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              users = req.body.users;

              done = function done(err, deletedUsers) {
                res.locals.setResponse(err, {
                  deletedUsers: deletedUsers
                });
                next();
              };

              deletedUsers = [];
              _context2.prev = 3;
              _context2.next = 6;
              return Promise.all(users.map(function (u) {
                return deleteUser(u.userId);
              }));

            case 6:
              deletedUsers = _context2.sent;
              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](3);
              return _context2.abrupt("return", done(_context2.t0));

            case 12:
              done(null, deletedUsers);

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[3, 9]]);
    }))();
  };
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(deleteUser, "deleteUser", "/home/farai/Workbench/neotree-editor/server/routes/users/_deleteUsersMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();