"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyScript = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var copyScript = function copyScript(_ref) {
  var id = _ref.scriptId;
  return new Promise(function (resolve, reject) {
    if (!id) return reject(new Error('Required script "id" is not provided.'));
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var scriptId, snap, script, scripts, screens, diagnosis;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              scriptId = null;
              _context.prev = 1;
              _context.next = 4;
              return _firebase["default"].database().ref('scripts').push();

            case 4:
              snap = _context.sent;
              scriptId = snap.key;
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](1);
              return _context.abrupt("return", reject(_context.t0));

            case 11:
              script = null;
              _context.prev = 12;
              _context.next = 15;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("scripts/".concat(id)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 15:
              script = _context.sent;
              _context.next = 20;
              break;

            case 18:
              _context.prev = 18;
              _context.t1 = _context["catch"](12);

            case 20:
              if (script) {
                _context.next = 22;
                break;
              }

              return _context.abrupt("return", reject(new Error("Script with id \"".concat(id, "\" not found"))));

            case 22:
              scripts = {};
              _context.prev = 23;
              _context.next = 26;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref('scripts').on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 26:
              scripts = _context.sent;
              _context.next = 31;
              break;

            case 29:
              _context.prev = 29;
              _context.t2 = _context["catch"](23);

            case 31:
              screens = {};
              _context.prev = 32;
              _context.next = 35;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("screens/".concat(id)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 35:
              screens = _context.sent;
              screens = screens || {};
              _context.next = 41;
              break;

            case 39:
              _context.prev = 39;
              _context.t3 = _context["catch"](32);

            case 41:
              diagnosis = {};
              _context.prev = 42;
              _context.next = 45;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref("diagnosis/".concat(id)).on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 45:
              diagnosis = _context.sent;
              diagnosis = diagnosis || {};
              _context.next = 51;
              break;

            case 49:
              _context.prev = 49;
              _context.t4 = _context["catch"](42);

            case 51:
              script = _objectSpread(_objectSpread({}, script), {}, {
                scriptId: scriptId,
                id: scriptId,
                position: Object.keys(scripts).length + 1
              });
              screens = Object.keys(screens).reduce(function (acc, key) {
                return _objectSpread(_objectSpread({}, acc), {}, (0, _defineProperty2["default"])({}, key, _objectSpread(_objectSpread({}, screens[key]), {}, {
                  scriptId: scriptId
                })));
              }, {});
              diagnosis = Object.keys(diagnosis).reduce(function (acc, key) {
                return _objectSpread(_objectSpread({}, acc), {}, (0, _defineProperty2["default"])({}, key, _objectSpread(_objectSpread({}, diagnosis[key]), {}, {
                  scriptId: scriptId
                })));
              }, {});
              _context.prev = 54;
              _context.next = 57;
              return _firebase["default"].database().ref("scripts/".concat(scriptId)).set(_objectSpread(_objectSpread({}, script), {}, {
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              }));

            case 57:
              _context.next = 62;
              break;

            case 59:
              _context.prev = 59;
              _context.t5 = _context["catch"](54);
              return _context.abrupt("return", reject(_context.t5));

            case 62:
              _context.prev = 62;
              _context.next = 65;
              return _firebase["default"].database().ref("screens/".concat(scriptId)).set(_objectSpread(_objectSpread({}, screens), {}, {
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              }));

            case 65:
              _context.next = 69;
              break;

            case 67:
              _context.prev = 67;
              _context.t6 = _context["catch"](62);

            case 69:
              _context.prev = 69;
              _context.next = 72;
              return _firebase["default"].database().ref("diagnosis/".concat(scriptId)).set(_objectSpread(_objectSpread({}, diagnosis), {}, {
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              }));

            case 72:
              _context.next = 76;
              break;

            case 74:
              _context.prev = 74;
              _context.t7 = _context["catch"](69);

            case 76:
              resolve(script);

            case 77:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 8], [12, 18], [23, 29], [32, 39], [42, 49], [54, 59], [62, 67], [69, 74]]);
    }))();
  });
};

exports.copyScript = copyScript;

var _default = function _default(app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var scripts, done, rslts;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              scripts = req.body.scripts;

              done = function done(err) {
                var rslts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                if (rslts.length) app.io.emit('create_scripts', {
                  key: app.getRandomString(),
                  scripts: scripts
                });
                res.locals.setResponse(err, {
                  scripts: rslts
                });
                next();
              };

              rslts = [];
              _context2.prev = 3;
              _context2.next = 6;
              return Promise.all(scripts.map(function (s) {
                return copyScript(s);
              }));

            case 6:
              rslts = _context2.sent;
              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](3);
              return _context2.abrupt("return", done(_context2.t0));

            case 12:
              done(null, rslts);

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[3, 9]]);
    }))();
  };
};

var _default2 = _default;
exports["default"] = _default2;
;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(copyScript, "copyScript", "/home/farai/WorkBench/neotree-editor/server/routes/scripts/duplicateScriptsMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/routes/scripts/duplicateScriptsMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();