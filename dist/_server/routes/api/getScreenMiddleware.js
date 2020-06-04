"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = JSON.parse(req.query.payload || '{}');

    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };

    _models.Screen.findOne({
      where: (0, _objectSpread2["default"])({}, payload)
    }).then(function (screen) {
      return done(null, {
        screen: screen
      });
    })["catch"](done);
  };
};