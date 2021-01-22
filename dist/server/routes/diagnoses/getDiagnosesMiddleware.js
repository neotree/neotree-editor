"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _database = require("../../database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var scriptId = req.query.scriptId;
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var done, diagnoses;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              done = function done(err, diagnoses) {
                res.locals.setResponse(err, {
                  diagnoses: diagnoses
                });
                next();
              };

              diagnoses = [];
              _context.prev = 2;
              _context.next = 5;
              return _database.Diagnosis.findAll({
                where: {
                  script_id: scriptId,
                  deletedAt: null
                },
                order: [['position', 'ASC']]
              });

            case 5:
              diagnoses = _context.sent;
              diagnoses = diagnoses.map(function (diagnosis) {
                var _JSON$parse = JSON.parse(JSON.stringify(diagnosis)),
                    data = _JSON$parse.data,
                    s = (0, _objectWithoutProperties2["default"])(_JSON$parse, ["data"]);

                return _objectSpread(_objectSpread({}, data), s);
              });
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](2);
              return _context.abrupt("return", done(_context.t0));

            case 12:
              done(null, diagnoses);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 9]]);
    }))();
  };
};