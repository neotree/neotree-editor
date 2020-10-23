"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _database = require("../../database");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var payload, done, scriptId, snap, scripts, script;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              payload = req.body;

              done = function done(err, script) {
                if (script) {
                  app.io.emit('create_scripts', {
                    key: app.getRandomString(),
                    scripts: [{
                      scriptId: script.scriptId
                    }]
                  });

                  _database.Log.create({
                    name: 'create_scripts',
                    data: JSON.stringify({
                      scripts: [{
                        scriptId: script.scriptId
                      }]
                    })
                  });
                }

                res.locals.setResponse(err, {
                  script: script
                });
                next();
              };

              scriptId = null;
              _context.prev = 3;
              _context.next = 6;
              return _firebase["default"].database().ref('scripts').push();

            case 6:
              snap = _context.sent;
              scriptId = snap.key;
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 13:
              scripts = {};
              _context.prev = 14;
              _context.next = 17;
              return new Promise(function (resolve) {
                _firebase["default"].database().ref('scripts').on('value', function (snap) {
                  return resolve(snap.val());
                });
              });

            case 17:
              scripts = _context.sent;
              scripts = scripts || {};
              _context.next = 23;
              break;

            case 21:
              _context.prev = 21;
              _context.t1 = _context["catch"](14);

            case 23:
              script = _objectSpread(_objectSpread({}, payload), {}, {
                scriptId: scriptId,
                id: scriptId,
                position: Object.keys(scripts).length + 1,
                createdAt: _firebase["default"].database.ServerValue.TIMESTAMP,
                updatedAt: _firebase["default"].database.ServerValue.TIMESTAMP
              });
              _context.prev = 24;
              _context.next = 27;
              return _firebase["default"].database().ref("scripts/".concat(scriptId)).set(script);

            case 27:
              _context.next = 32;
              break;

            case 29:
              _context.prev = 29;
              _context.t2 = _context["catch"](24);
              return _context.abrupt("return", done(_context.t2));

            case 32:
              _context.prev = 32;
              _context.next = 35;
              return _database.Script.findOrCreate({
                where: {
                  script_id: script.scriptId
                },
                defaults: {
                  position: script.position,
                  data: JSON.stringify(script)
                }
              });

            case 35:
              _context.next = 39;
              break;

            case 37:
              _context.prev = 37;
              _context.t3 = _context["catch"](32);

            case 39:
              done(null, script);

            case 40:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 10], [14, 21], [24, 29], [32, 37]]);
    }))();
  };
};