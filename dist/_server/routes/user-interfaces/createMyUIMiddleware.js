"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = res.locals.createUIParams || req.body;
    var user = req.user ? req.user.id : null;
    if (!user) return done({
      msg: 'Required user "id" is not provided.'
    });

    var done = function done(err, ui) {
      res.locals.setResponse(err, {
        ui: ui
      });
      next();
      return null;
    };

    _models.UserInterface.findOne({
      where: {
        user: user
      }
    })["catch"](done).then(function (ui) {
      if (ui) return done(null, ui);

      _models.UserInterface.create((0, _objectSpread2["default"])({}, payload, {
        user: user
      })).then(function (ui) {
        return done(null, ui);
      })["catch"](done);

      return null;
    });
  };
};