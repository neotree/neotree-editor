"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var _JSON$parse = JSON.parse(req.query.payload || {}),
        filters = _JSON$parse.filters,
        payload = (0, _objectWithoutProperties2["default"])(_JSON$parse, ["filters"]);

    var done = function done(err, screens) {
      res.locals.setResponse(err, {
        screens: screens
      });
      next();
      return null;
    };

    _models.Screen.findAll((0, _objectSpread2["default"])({
      where: payload,
      order: [['position', 'ASC']]
    }, filters)).then(function (screens) {
      return done(null, screens);
    })["catch"](done);
  };
};