"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = require("../../firebase");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

// module.exports = app => (req, res, next) => {
//   app.passport.authenticate('local', (error, user, info) => {
//     if (error) {
//       res.locals.setResponse(error);
//       next(); return null;
//     }
//
//     if (!user) {
//       res.locals.setResponse(info);
//       next(); return null;
//     }
//
//     req.logIn(user, err => {
//       if (err) {
//         res.locals.setResponse(err);
//         next(); return null;
//       }
//
//       res.locals.setResponse(null, { user });
//       next(); return null;
//     });
//   })(req, res, next);
// };
module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
        password = _req$body.password,
        username = _req$body.username;

    var done = function done(err, rslts) {
      res.locals.setResponse(err, rslts);
      next();
    };

    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var authenticated, user;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              authenticated = null;
              user = null;
              _context.prev = 2;
              _context.next = 5;
              return _firebase.firebase.auth().signInWithEmailAndPassword(username, password);

            case 5:
              authenticated = _firebase.firebase.auth().currentUser;
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](2);
              return _context.abrupt("return", done(_context.t0));

            case 11:
              if (!authenticated) {
                _context.next = 20;
                break;
              }

              _context.prev = 12;
              _context.next = 15;
              return new Promise(function (resolve) {
                _firebase.firebaseAdmin.database().ref("users/".concat(authenticated.uid)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 15:
              user = _context.sent;
              _context.next = 20;
              break;

            case 18:
              _context.prev = 18;
              _context.t1 = _context["catch"](12);

            case 20:
              done(null, {
                user: user
              });

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 8], [12, 18]]);
    }))();
  };
};