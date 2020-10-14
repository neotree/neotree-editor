"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _database = require("./database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

module.exports = function () {
  return function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var user, html, $, $APP;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              user = null;
              _context.prev = 1;

              if (req.isAuthenticated()) {
                _context.next = 6;
                break;
              }

              _context.t0 = null;
              _context.next = 9;
              break;

            case 6:
              _context.next = 8;
              return _database.User.findOne({
                where: {
                  id: req.user.id
                }
              });

            case 8:
              _context.t0 = _context.sent;

            case 9:
              user = _context.t0;
              _context.next = 14;
              break;

            case 12:
              _context.prev = 12;
              _context.t1 = _context["catch"](1);

            case 14:
              html = _fs["default"].readFileSync(_path["default"].resolve(__dirname, '../src/index.html'), 'utf8');
              $ = _cheerio["default"].load(html);
              $APP = JSON.stringify({
                authenticatedUser: !user ? null : _objectSpread({}, user),
                app_name: process.env.APP_NAME,
                app_slug: process.env.APP_SLUG,
                app_url: process.env.APP_URL
              });
              $('head').append("<script type=\"text/javascript\">const $APP = ".concat($APP, ";</script>"));
              res.send($.html());

            case 19:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 12]]);
    }))();
  };
};