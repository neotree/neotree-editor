"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createScript = createScript;
exports.createScriptMiddleware = createScriptMiddleware;
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _firebase = _interopRequireDefault(require("../../firebase"));
var _database = require("../../database");
var _excluded = ["data"];
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
function createScript() {
  return _createScript.apply(this, arguments);
}
function _createScript() {
  _createScript = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var payload,
      scriptId,
      snap,
      scriptsCount,
      script,
      rslts,
      _JSON$parse,
      data,
      s,
      _args2 = arguments;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          payload = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};
          scriptId = null;
          _context2.prev = 2;
          _context2.next = 5;
          return _firebase["default"].database().ref('scripts').push();
        case 5:
          snap = _context2.sent;
          scriptId = snap.key;
          _context2.next = 12;
          break;
        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](2);
          throw _context2.t0;
        case 12:
          scriptsCount = 0;
          _context2.prev = 13;
          _context2.next = 16;
          return _database.Script.count({
            where: {}
          });
        case 16:
          scriptsCount = _context2.sent;
          _context2.next = 21;
          break;
        case 19:
          _context2.prev = 19;
          _context2.t1 = _context2["catch"](13);
        case 21:
          script = _objectSpread(_objectSpread({}, payload), {}, {
            scriptId: scriptId,
            script_id: scriptId,
            position: scriptsCount + 1,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
            updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
          });
          _context2.prev = 22;
          _context2.next = 25;
          return _database.Script.findOrCreate({
            where: {
              script_id: script.scriptId
            },
            defaults: {
              position: script.position,
              data: JSON.stringify(script)
            }
          });
        case 25:
          rslts = _context2.sent;
          if (rslts && rslts[0]) {
            _JSON$parse = JSON.parse(JSON.stringify(rslts[0])), data = _JSON$parse.data, s = (0, _objectWithoutProperties2["default"])(_JSON$parse, _excluded);
            script = _objectSpread(_objectSpread({}, data), s);
          }
          _context2.next = 32;
          break;
        case 29:
          _context2.prev = 29;
          _context2.t2 = _context2["catch"](22);
          throw _context2.t2;
        case 32:
          return _context2.abrupt("return", script);
        case 33:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[2, 9], [13, 19], [22, 29]]);
  }));
  return _createScript.apply(this, arguments);
}
function createScriptMiddleware() {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var done, script;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            done = function done(err, script) {
              res.locals.setResponse(err, {
                script: script
              });
              next();
            };
            _context.prev = 1;
            _context.next = 4;
            return createScript(req.body);
          case 4:
            script = _context.sent;
            done(null, script);
            _context.next = 11;
            break;
          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](1);
            return _context.abrupt("return", done(_context.t0));
          case 11:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[1, 8]]);
    }))();
  };
}
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(createScript, "createScript", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/scripts/createScriptMiddleware.js");
  reactHotLoader.register(createScriptMiddleware, "createScriptMiddleware", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/scripts/createScriptMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();