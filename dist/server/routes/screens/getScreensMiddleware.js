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
      var scriptId, done, screens;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              scriptId = req.query.scriptId;

              done = function done(err, screens) {
                res.locals.setResponse(err, {
                  screens: screens
                });
                next();
              };

              if (scriptId) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", done(new Error('Required script "id" is not provided.')));

            case 4:
              screens = {};
              _context.prev = 5;
              _context.next = 8;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("screens/".concat(scriptId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 8:
              screens = _context.sent;
              screens = screens || {};
              _context.next = 15;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context["catch"](5);
              return _context.abrupt("return", done(_context.t0));

            case 15:
              done(null, Object.keys(screens).map(function (key) {
                return screens[key];
              }).sort(function (a, b) {
                return a.position - b.position;
              }));

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[5, 12]]);
    }))();
  };
};