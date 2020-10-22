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
      var _req$query, scriptId, diagnosisId, done, diagnosis;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _req$query = req.query, scriptId = _req$query.scriptId, diagnosisId = _req$query.diagnosisId;

              done = function done(err, diagnosis) {
                res.locals.setResponse(err, {
                  diagnosis: diagnosis
                });
                next();
              };

              if (scriptId) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", done(new Error('Required script "id" is not provided.')));

            case 4:
              if (diagnosisId) {
                _context.next = 6;
                break;
              }

              return _context.abrupt("return", done(new Error('Required diagnosis "id" is not provided.')));

            case 6:
              diagnosis = null;
              _context.prev = 7;
              _context.next = 10;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("diagnosis/".concat(scriptId, "/").concat(diagnosisId)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 10:
              diagnosis = _context.sent;
              _context.next = 16;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](7);
              return _context.abrupt("return", done(_context.t0));

            case 16:
              done(null, diagnosis);

            case 17:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[7, 13]]);
    }))();
  };
};