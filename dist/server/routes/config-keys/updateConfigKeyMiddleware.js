"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.updateConfigKey = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../database/models");

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var updateConfigKey = function updateConfigKey(_ref) {
  var id = _ref.id,
      payload = (0, _objectWithoutProperties2["default"])(_ref, ["id"]);
  return new Promise(function (resolve, reject) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var configKey;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (id) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", reject(new Error('Required configKey "id" is not provided.')));

            case 2:
              configKey = null;
              _context.prev = 3;
              _context.next = 6;
              return _models.ConfigKey.findOne({
                where: {
                  id: id
                }
              });

            case 6:
              configKey = _context.sent;
              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", reject(_context.t0));

            case 12:
              if (configKey) {
                _context.next = 14;
                break;
              }

              return _context.abrupt("return", reject(new Error("ConfigKey with id \"".concat(id, "\" not found"))));

            case 14:
              _context.prev = 14;
              _context.next = 17;
              return _models.ConfigKey.update({
                position: payload.position || configKey.position,
                data: JSON.stringify(_objectSpread(_objectSpread({}, configKey.data), payload))
              }, {
                where: {
                  id: id,
                  deletedAt: null
                }
              });

            case 17:
              _context.next = 21;
              break;

            case 19:
              _context.prev = 19;
              _context.t1 = _context["catch"](14);

            case 21:
              resolve(configKey);

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9], [14, 19]]);
    }))();
  });
};

exports.updateConfigKey = updateConfigKey;

var _default = function _default() {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var done, configKey;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              done = function done(err, configKey) {
                res.locals.setResponse(err, {
                  configKey: configKey
                });
                next();
              };

              configKey = null;
              _context2.prev = 2;
              _context2.next = 5;
              return updateConfigKey(req.body);

            case 5:
              configKey = _context2.sent;
              _context2.next = 11;
              break;

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](2);
              return _context2.abrupt("return", done(_context2.t0));

            case 11:
              done(null, configKey);

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[2, 8]]);
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

  reactHotLoader.register(updateConfigKey, "updateConfigKey", "/home/farai/WorkBench/neotree-editor/server/routes/config-keys/updateConfigKeyMiddleware.js");
  reactHotLoader.register(_default, "default", "/home/farai/WorkBench/neotree-editor/server/routes/config-keys/updateConfigKeyMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();