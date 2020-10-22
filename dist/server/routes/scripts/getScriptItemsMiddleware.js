"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var scriptId, done, screens, diagnosis;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              scriptId = req.query.scriptId;

              done = function done(err, screens, diagnoses) {
                res.locals.setResponse(err, {
                  screens: screens,
                  diagnoses: diagnoses
                });
                next();
              };

              screens = {};
              _context.prev = 3;
              _context.next = 6;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("screens/".concat(scriptId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 6:
              screens = _context.sent;
              screens = screens || {};
              _context.next = 12;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](3);

            case 12:
              diagnosis = {};
              _context.prev = 13;
              _context.next = 16;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("diagnosis/".concat(scriptId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 16:
              diagnosis = _context.sent;
              diagnosis = diagnosis || {};
              _context.next = 22;
              break;

            case 20:
              _context.prev = 20;
              _context.t1 = _context["catch"](13);

            case 22:
              done(null, Object.keys(screens).map(function (key) {
                return screens[key];
              }).sort(function (a, b) {
                return a.position - b.position;
              }), Object.keys(diagnosis).map(function (key) {
                return diagnosis[key];
              }).sort(function (a, b) {
                return a.position - b.position;
              }));

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 10], [13, 20]]);
    }))();
  };
};