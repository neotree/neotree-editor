"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var _firebase = _interopRequireDefault(require("../../firebase"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

module.exports = function (app) {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, screen) {
      if (err) app.logger.log(err);
      if (screen) app.io.emit('create_screens', {
        screens: [{
          id: screen.id
        }]
      });
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

          _firebase["default"].database().ref("screens/".concat(payload.script_id, "/").concat(screenId)).set(_objectSpread(_objectSpread(_objectSpread({}, rest), _data), {}, {
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
          screen_id = _ref2[1];

      _models.Screen.create(_objectSpread(_objectSpread({}, payload), {}, {
        position: count + 1,
        screen_id: screen_id
      })).then(function (screen) {
        return done(null, screen);
      })["catch"](done);
    })["catch"](done);
  };
};