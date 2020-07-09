"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.copyConfigKey = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var copyConfigKey = function copyConfigKey(configKey) {
  return new Promise(function (resolve, reject) {
    _firebase["default"].database().ref('configkeys').push().then(function (snap) {
      var data = configKey.data,
          rest = (0, _objectWithoutProperties2["default"])(configKey, ["data"]);
      var configKeyId = snap.key;

      _firebase["default"].database().ref("configkeys/".concat(configKeyId)).set(_objectSpread(_objectSpread(_objectSpread({}, rest), data), {}, {
        configKeyId: configKeyId,
        createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
      })).then(function () {
        _models.ConfigKey.create(_objectSpread(_objectSpread({}, configKey), {}, {
          id: configKeyId,
          data: JSON.stringify(configKey.data)
        })).then(function (configKey) {
          return resolve(configKey);
        })["catch"](reject);
      })["catch"](reject);
    })["catch"](reject);
  });
};

exports.copyConfigKey = copyConfigKey;

var _default = function _default(app) {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, configKey) {
      if (configKey) app.io.emit('createconfig_keys', {
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

    if (!id) return done({
      msg: 'Required configKey "id" is not provided.'
    });
    Promise.all([_models.ConfigKey.findOne({
      where: {
        id: id
      }
    })]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 1),
          configKey = _ref2[0];

      if (!configKey) return done({
        msg: "Could not find configKey with \"id\" ".concat(id, ".")
      });
      configKey = configKey.toJSON();
      copyConfigKey(configKey).then(function (configKey) {
        return done(null, configKey);
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};

exports["default"] = _default;