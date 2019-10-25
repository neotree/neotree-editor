"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app, params) {
  return function (req, res, next) {
    var payload = params || req.body;

    var done = function done(err, script) {
      res.locals.setResponse(err, {
        script: script
      });
      next();
      return null;
    };

    var saveToFirebase = function saveToFirebase() {
      return new Promise(function (resolve, reject) {
        _firebase["default"].database().ref('scripts').push().then(function (snap) {
          var data = payload.data,
              rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]);
          var scriptId = snap.key;
          resolve(scriptId);

          var _data = data ? JSON.parse(data) : null;

          _firebase["default"].database().ref('scripts').child(scriptId).update((0, _objectSpread2["default"])({}, rest, {}, _data, {
            scriptId: scriptId
          }));
        })["catch"](reject);
      });
    };

    saveToFirebase().then(function (id) {
      _models.Script.create((0, _objectSpread2["default"])({}, payload, {
        id: id
      })).then(function (script) {
        return done(null, script);
      })["catch"](done);
    })["catch"](done);
  };
};