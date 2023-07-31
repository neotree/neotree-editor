"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _firebase = _interopRequireDefault(require("../../firebase"));
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
}; // import { User } from '../../database';
// module.exports = () => (req, res, next) => {
//   const { email } = req.query;
//
//   const done = ((err, payload) => {
//     res.locals.setResponse(err, err ? null : payload);
//     next();
//   });
//
//   User.findOne({ where: { email } })
//     .catch(done)
//     .then(u => done(
//       u ? null : { msg: 'Email address not registered.' },
//       !u ? null : { activated: u.password ? true : false, userId: u.id, email: u.email },
//     ));
// };
module.exports = function () {
  return function (req, res, next) {
    var email = req.query.email;
    var done = function done(err, payload) {
      res.locals.setResponse(err, err ? null : payload);
      next();
    };
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var user, userDetails;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            user = null;
            _context.prev = 1;
            _context.next = 4;
            return _firebase["default"].auth().getUserByEmail(email);
          case 4:
            user = _context.sent;
            _context.next = 10;
            break;
          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](1);
            return _context.abrupt("return", done(_context.t0));
          case 10:
            if (user) {
              _context.next = 12;
              break;
            }
            return _context.abrupt("return", done('Email address not registered'));
          case 12:
            userDetails = null;
            _context.prev = 13;
            _context.next = 16;
            return new Promise(function (resolve) {
              _firebase["default"].database().ref("users/".concat(user.uid)).on('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 16:
            userDetails = _context.sent;
            _context.next = 22;
            break;
          case 19:
            _context.prev = 19;
            _context.t1 = _context["catch"](13);
            return _context.abrupt("return", done(_context.t1));
          case 22:
            done(null, {
              email: email,
              userId: user.uid,
              activated: userDetails ? !!userDetails.activated : false
            });
          case 23:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 7], [13, 19]]);
    }))();
  };
};