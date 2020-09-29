"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var payload, done, position, saveToFirebase, id;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              payload = req.body;

              done = function done(err, configKey) {
                if (configKey) app.io.emit('create_config_keys', {
                  key: app.getRandomString(),
                  config_keys: [{
                    id: configKey.id
                  }]
                });
                res.locals.setResponse(err, {
                  configKey: configKey
                });
                next();
                return null;
              };

              position = 0;
              _context.prev = 3;
              _context.next = 6;
              return _models.ConfigKey.count({
                where: {}
              });

            case 6:
              position = _context.sent;
              position++;
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](3);
              return _context.abrupt("return", done(_context.t0));

            case 13:
              saveToFirebase = function saveToFirebase() {
                return new Promise(function (resolve, reject) {
                  _firebase["default"].database().ref('configkeys').push().then(function (snap) {
                    var data = payload.data,
                        rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]);
                    var configKeyId = snap.key;

                    var _data = data ? JSON.parse(data) : null;

                    _firebase["default"].database().ref("configkeys/".concat(configKeyId)).set(_objectSpread(_objectSpread(_objectSpread({}, rest), _data), {}, {
                      position: position,
                      configKeyId: configKeyId,
                      createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
                    })).then(function () {
                      resolve(configKeyId);
                    })["catch"](reject);
                  })["catch"](reject);
                });
              };

              _context.prev = 14;
              _context.next = 17;
              return saveToFirebase();

            case 17:
              id = _context.sent;

              _models.ConfigKey.create(_objectSpread(_objectSpread({}, payload), {}, {
                position: position,
                id: id
              })).then(function (configKey) {
                return done(null, configKey);
              })["catch"](done);

              _context.next = 24;
              break;

            case 21:
              _context.prev = 21;
              _context.t1 = _context["catch"](14);
              done(_context.t1);

            case 24:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 10], [14, 21]]);
    }))();
  };
};