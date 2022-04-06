"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _check = require("express-validator/check");

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _models = require("../../database/models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

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

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _req$body, password, username, done, errors, encryptedPassword, user;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _req$body = req.body, password = _req$body.password, username = _req$body.username;

              done = function done(err, rslts) {
                res.locals.setResponse(err, rslts);
                next();
                return null;
              };

              errors = (0, _check.validationResult)(req);
              if (!errors.isEmpty()) done(errors.array());
              encryptedPassword = null;
              _context.prev = 5;
              _context.next = 8;
              return encryptPassword(password);

            case 8:
              encryptedPassword = _context.sent;
              _context.next = 14;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](5);
              return _context.abrupt("return", done(_context.t0));

            case 14:
              _context.prev = 14;
              _context.next = 17;
              return _models.User.update({
                password: encryptedPassword
              }, {
                where: {
                  email: username
                },
                individualHooks: true
              });

            case 17:
              _context.next = 22;
              break;

            case 19:
              _context.prev = 19;
              _context.t1 = _context["catch"](14);
              return _context.abrupt("return", done(_context.t1));

            case 22:
              user = null;
              _context.prev = 23;
              _context.next = 26;
              return _models.User.findOne({
                where: {
                  email: username
                }
              });

            case 26:
              user = _context.sent;
              _context.next = 32;
              break;

            case 29:
              _context.prev = 29;
              _context.t2 = _context["catch"](23);
              return _context.abrupt("return", done(_context.t2));

            case 32:
              req.logIn(user, function (err) {
                if (err) done(err);
                done(null, {
                  user: user
                });
              });

            case 33:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 11], [14, 19], [23, 29]]);
    }))();
  };
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(encryptPassword, "encryptPassword", "/home/farai/Workbench/neotree-editor/server/routes/auth/signUpMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();