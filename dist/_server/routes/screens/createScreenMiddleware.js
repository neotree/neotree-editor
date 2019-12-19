"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, screen) {
      if (err) app.logger.log(err);
      res.locals.setResponse(err, {
        screen: screen
      });
      next();
      return null;
    };

    var saveToFirebase = function saveToFirebase() {
      return new Promise(function (resolve, reject) {
        _firebase["default"].database().ref("screens/".concat(payload.script_id)).push().then(function (snap) {
          var data = payload.data,
              rest = (0, _objectWithoutProperties2["default"])(payload, ["data"]);
          var screenId = snap.key;

          var _data = data ? JSON.parse(data) : null;

          _firebase["default"].database().ref("screens/".concat(payload.script_id, "/").concat(screenId)).set((0, _objectSpread2["default"])({}, rest, {}, _data, {
            screenId: screenId,
            scriptId: payload.script_id,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
          })).then(function () {
            resolve(screenId);
          })["catch"](reject);
        })["catch"](reject);
      });
    };

    Promise.all([_models.Screen.count({
      where: {
        script_id: payload.script_id
      }
    }), saveToFirebase()]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          count = _ref2[0],
          id = _ref2[1];

      _models.Screen.create((0, _objectSpread2["default"])({}, payload, {
        position: count + 1,
        id: id
      })).then(function (screen) {
        return done(null, screen);
      })["catch"](done);
    })["catch"](done);
  };
};