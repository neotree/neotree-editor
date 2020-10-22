"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _firebase = require("./firebase");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var authenticated, user, html, $, $APP;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              authenticated = _firebase.firebase.auth().currentUser;
              user = null;

              if (!authenticated) {
                _context.next = 11;
                break;
              }

              _context.prev = 3;
              _context.next = 6;
              return new Promise(function (resolve) {
                _firebase.firebaseAdmin.database().ref("users/".concat(authenticated.uid)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 6:
              user = _context.sent;
              _context.next = 11;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);

            case 11:
              html = _fs["default"].readFileSync(_path["default"].resolve(__dirname, '../src/index.html'), 'utf8');
              $ = _cheerio["default"].load(html);
              $APP = JSON.stringify({
                authenticatedUser: !user ? null : _objectSpread({}, user),
                firebaseConfig: _firebase.firebaseOptions,
                app_name: process.env.APP_NAME,
                app_slug: process.env.APP_SLUG,
                app_url: process.env.APP_URL
              }, null, 4);
              $('head').append("<script type=\"text/javascript\">\n    const $APP = ".concat($APP, ";\n</script>\n"));
              res.send($.html());

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9]]);
    }))();
  };
};