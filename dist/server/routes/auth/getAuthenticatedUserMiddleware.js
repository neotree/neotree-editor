"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _models = require("../../models");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app, payload, callback) {
  return function (req, res, next) {
    var done = callback || function (err, payload) {
      res.locals.setResponse(err, err ? null : payload);
      next();
    };

    if (req.isAuthenticated()) {
      return Promise.all([_models.User.findOne({
        where: {
          id: req.user.id
        }
      }), _models.UserProfile.findOne({
        where: {
          user_id: req.user.id
        }
      })]).then(function (_ref) {
        var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
            user = _ref2[0],
            profile = _ref2[1];

        return done(null, !profile ? null : {
          authenticatedUser: _objectSpread({
            role: user ? user.role : 0
          }, JSON.parse(JSON.stringify(profile)))
        });
      })["catch"](done);
    }

    done(null, {
      authenticatedUser: null
    });
  };
};