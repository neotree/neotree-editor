"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _cheerio = _interopRequireDefault(require("cheerio"));
var _models = require("./database/models");
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var user, html, $, $APP;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            user = null;
            if (!req.isAuthenticated()) {
              _context.next = 11;
              break;
            }
            _context.prev = 2;
            _context.next = 5;
            return _models.User.findOne({
              where: {
                email: req.user.email
              }
            });
          case 5:
            user = _context.sent;
            if (user) {
              user = JSON.parse(JSON.stringify(user));
              delete user.password;
            }
            _context.next = 11;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](2);
          case 11:
            html = _fs["default"].readFileSync(_path["default"].resolve(__dirname, '../src/index.html'), 'utf8');
            $ = _cheerio["default"].load(html);
            $APP = JSON.stringify({
              authenticatedUser: user,
              app_name: process.env.APP_NAME,
              app_slug: process.env.APP_SLUG,
              app_url: process.env.APP_URL,
              country: process.env.COUNTRY,
              viewMode: req.session.viewMode || 'view'
            }, null, 4);
            $('head').append("<script type=\"text/javascript\">\n    const $APP = ".concat($APP, ";\n</script>\n"));
            res.send($.html());
          case 16:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[2, 9]]);
    }))();
  };
};