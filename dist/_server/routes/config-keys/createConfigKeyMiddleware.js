"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, configKey) {
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
          resolve(configKeyId);

          var _data = data ? JSON.parse(data) : null;

          _firebase["default"].database().ref('configkeys').child(configKeyId).update((0, _objectSpread2["default"])({}, rest, {}, _data, {
            configKeyId: configKeyId
          }));
        })["catch"](reject);
      });
    };

    saveToFirebase().then(function (id) {
      _models.ConfigKey.create((0, _objectSpread2["default"])({}, payload, {
        id: id
      })).then(function (configKey) {
        return done(null, configKey);
      })["catch"](done);
    })["catch"](done);
  };
};