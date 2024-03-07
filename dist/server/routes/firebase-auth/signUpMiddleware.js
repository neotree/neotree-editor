"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _firebase = require("../../firebase");
var _models = require("../../database/models");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
// module.exports = (app, payload, callback) => (req, res, next) => {
//   const {
//     loginOnSignUp,
//     password2, // eslint-disable-line
//     ...params
//   } = { ...(payload || req.body) };
//
//   const done = callback || ((err, rslts) => {
//     res.locals.setResponse(err, rslts);
//     next(); return null;
//   });
//
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) done(errors.array());
//
//   require('../../utils/addOrUpdateUser')(params)
//     .then(user => {
//       if (!user) return done({ msg: 'Something went wrong' });
//
//       if (loginOnSignUp === false) return done(null, user);
//
//       req.logIn(user, err => {
//         if (err) done(err);
//
//         done(null, { user });
//       });
//     }).catch(done);
// };

module.exports = function (app, payload, callback) {
  return function (req, res, next) {
    var _ref = _objectSpread({}, payload || req.body),
      loginOnSignUp = _ref.loginOnSignUp,
      password = _ref.password,
      username = _ref.username;
    var done = callback || function (err, rslts) {
      res.locals.setResponse(err, rslts);
      next();
    };
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var user, userDetails, authenticated;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            user = null;
            _context.prev = 1;
            _context.next = 4;
            return _firebase.firebaseAdmin.auth().getUserByEmail(username);
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
            _context.prev = 12;
            _context.next = 15;
            return _firebase.firebaseAdmin.auth().updateUser(user.uid, {
              password: password
            });
          case 15:
            _context.next = 20;
            break;
          case 17:
            _context.prev = 17;
            _context.t1 = _context["catch"](12);
            return _context.abrupt("return", done(_context.t1));
          case 20:
            userDetails = null;
            _context.prev = 21;
            _context.next = 24;
            return new Promise(function (resolve) {
              _firebase.firebaseAdmin.database().ref("users/".concat(user.uid)).on('value', function (snap) {
                return resolve(snap.val());
              });
            });
          case 24:
            userDetails = _context.sent;
            _context.next = 30;
            break;
          case 27:
            _context.prev = 27;
            _context.t2 = _context["catch"](21);
            return _context.abrupt("return", done(_context.t2));
          case 30:
            userDetails = _objectSpread(_objectSpread({
              email: username,
              id: user.uid,
              userId: user.uid,
              hospitals: [],
              countries: []
            }, userDetails), {}, {
              activated: true
            });
            _context.prev = 31;
            _context.next = 34;
            return _firebase.firebaseAdmin.database().ref("users/".concat(user.uid)).set(userDetails);
          case 34:
            _context.next = 39;
            break;
          case 36:
            _context.prev = 36;
            _context.t3 = _context["catch"](31);
            return _context.abrupt("return", done(_context.t3));
          case 39:
            _context.prev = 39;
            _context.next = 42;
            return _models.User.findOrCreate({
              where: {
                email: userDetails.email
              },
              defaults: {
                user_id: userDetails.userId,
                email: userDetails.email,
                data: JSON.stringify(userDetails)
              }
            });
          case 42:
            _context.next = 46;
            break;
          case 44:
            _context.prev = 44;
            _context.t4 = _context["catch"](39);
          case 46:
            if (!(loginOnSignUp === false)) {
              _context.next = 48;
              break;
            }
            return _context.abrupt("return", done(null, {
              user: userDetails
            }));
          case 48:
            authenticated = null;
            _context.prev = 49;
            _context.next = 52;
            return _firebase.firebase.auth().signInWithEmailAndPassword(username, password);
          case 52:
            authenticated = _firebase.firebase.auth().currentUser;
            _context.next = 58;
            break;
          case 55:
            _context.prev = 55;
            _context.t5 = _context["catch"](49);
            return _context.abrupt("return", done(_context.t5));
          case 58:
            done(null, {
              user: authenticated
            });
          case 59:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 7], [12, 17], [21, 27], [31, 36], [39, 44], [49, 55]]);
    }))();
  };
};