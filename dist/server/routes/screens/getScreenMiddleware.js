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
      var _req$query, scriptId, screenId, done, screen;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _req$query = req.query, scriptId = _req$query.scriptId, screenId = _req$query.screenId;

              done = function done(err, screen) {
                res.locals.setResponse(err, {
                  screen: screen
                });
                next();
              };

              if (scriptId) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", done(new Error('Required script "id" is not provided.')));

            case 4:
              if (screenId) {
                _context.next = 6;
                break;
              }

              return _context.abrupt("return", done(new Error('Required screen "id" is not provided.')));

            case 6:
              screen = null;
              _context.prev = 7;
              _context.next = 10;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("screens/".concat(scriptId, "/").concat(screenId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 10:
              screen = _context.sent;
              _context.next = 16;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](7);
              return _context.abrupt("return", done(_context.t0));

            case 16:
              done(null, screen);

            case 17:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[7, 13]]);
    }))();
  };
};