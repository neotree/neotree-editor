"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _updateDiagnosisMiddleware = require("./updateDiagnosisMiddleware");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var diagnoses, done, updatedDiagnoses;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              diagnoses = req.body.diagnoses;

              done = function done(err, updatedDiagnoses) {
                if (!err) app.io.emit('update_diagnoses', {
                  key: app.getRandomString(),
                  diagnoses: diagnoses.map(function (s) {
                    return {
                      diagnosisId: s.diagnosisId,
                      scriptId: s.scriptId
                    };
                  })
                });
                res.locals.setResponse(err, {
                  updatedDiagnoses: updatedDiagnoses
                });
                next();
              };

              updatedDiagnoses = [];
              _context.prev = 3;
              _context.next = 6;
              return Promise.all(diagnoses.map(function (s) {
                return (0, _updateDiagnosisMiddleware.updateDiagnosis)(s);
              }));

            case 6:
              updatedDiagnoses = _context.sent;
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 12:
              done(null, updatedDiagnoses);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9]]);
    }))();
  };
};