"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, configKey) {
      if (configKey) {
        app.io.emit('create_config_keys', {
          configKeys: [{
            configKeyId: configKey.id
          }]
        });

        _models.Log.create({
          name: 'create_config_keys',
          data: JSON.stringify({
            configKeys: [{
              configKeyId: configKey.id
            }]
          })
        });
      }

      res.locals.setResponse(err, {
        configKey: configKey
      });
      next();
      return null;
    };

    var saveToFirebase = function saveToFirebase() {
      return new Promise(function (resolve, reject) {
        _firebase["default"].database().ref('configkeys').push().then(function (snap) {
          var data = payload.data,
              rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]);
          var configKeyId = snap.key;

          var _data = data ? JSON.parse(data) : null;

          _firebase["default"].database().ref("configkeys/".concat(configKeyId)).set(_objectSpread(_objectSpread(_objectSpread({}, rest), _data), {}, {
            configKeyId: configKeyId,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
          })).then(function () {
            resolve(configKeyId);
          })["catch"](reject);
        })["catch"](reject);
      });
    };

    saveToFirebase().then(function (id) {
      _models.ConfigKey.create(_objectSpread(_objectSpread({}, payload), {}, {
        id: id
      })).then(function (configKey) {
        return done(null, configKey);
      })["catch"](done);
    })["catch"](done);
  };
};