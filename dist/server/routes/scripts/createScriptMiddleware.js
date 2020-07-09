"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _firebase = _interopRequireDefault(require("../../firebase"));

var _models = require("../../models");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

module.exports = function (app, params) {
  return function (req, res, next) {
    var payload = params || req.body;

    var done = function done(err, script) {
      if (script) app.io.emit('create_scripts', {
        scripts: [{
          id: script.id
        }]
      });
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

          var _data = data ? JSON.parse(data) : null;

          _firebase["default"].database().ref("scripts/".concat(scriptId)).set(_objectSpread(_objectSpread(_objectSpread({}, rest), _data), {}, {
            scriptId: scriptId,
            createdAt: _firebase["default"].database.ServerValue.TIMESTAMP
          })).then(function () {
            resolve(scriptId);
          })["catch"](reject);
        })["catch"](reject);
      });
    };

    Promise.all([_models.Script.count({
      where: {}
    }), saveToFirebase()]).then(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          count = _ref2[0],
          id = _ref2[1];

      _models.Script.create(_objectSpread(_objectSpread({}, payload), {}, {
        position: count + 1,
        id: id
      })).then(function (script) {
        return done(null, script);
      })["catch"](done);
    })["catch"](done);
  };
};