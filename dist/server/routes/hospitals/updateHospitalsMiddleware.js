"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _updateHospitalMiddleware = require("./updateHospitalMiddleware");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var hospitals, done, updatedHospitals;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              hospitals = req.body.hospitals;

              done = function done(err, updatedHospitals) {
                if (err) {
                  res.locals.setResponse(err);
                  return next();
                }

                app.io.emit('update_config_keys', {
                  key: app.getRandomString(),
                  hospitals: hospitals.map(function (s) {
                    return {
                      hospitalId: s.hospitalId
                    };
                  })
                });
                res.locals.setResponse(null, {
                  updatedHospitals: updatedHospitals
                });
                next();
              };

              updatedHospitals = [];
              _context.prev = 3;
              _context.next = 6;
              return Promise.all(hospitals.map(function (s) {
                return (0, _updateHospitalMiddleware.updateHospital)(s);
              }));

            case 6:
              updatedHospitals = _context.sent;
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 12:
              done(null, updatedHospitals);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9]]);
    }))();
  };
};