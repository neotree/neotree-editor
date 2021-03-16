"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _database = require("../../database");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var hospitals, done, updatedHospitals;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              hospitals = req.body.hospitals;

              done = function done(err) {
                var rslts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

                if (err) {
                  res.locals.setResponse(err);
                  return next();
                }

                res.locals.setResponse(null, {
                  updatedHospitals: rslts.map(function (rslt) {
                    return rslt[1];
                  })
                });
                next();
              };

              _context.prev = 2;
              _context.next = 5;
              return Promise.all(hospitals.map(function (_ref2) {
                var id = _ref2.id,
                    payload = (0, _objectWithoutProperties2["default"])(_ref2, ["id"]);
                return _database.Hospital.update(payload, {
                  where: {
                    id: id
                  },
                  returning: true,
                  plain: true
                });
              }));

            case 5:
              updatedHospitals = _context.sent;
              done(null, updatedHospitals);
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](2);
              return _context.abrupt("return", done(_context.t0));

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 9]]);
    }))();
  };
};