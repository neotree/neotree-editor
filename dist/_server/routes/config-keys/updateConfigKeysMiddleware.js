"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
        configKeys = _req$body.configKeys,
        returnUpdated = _req$body.returnUpdated;

    var done = function done(err, payload) {
      res.locals.setResponse(err, payload);
      next();
      return null;
    };

    Promise.all(configKeys.map(function (_ref) {
      var id = _ref.id,
          scr = (0, _objectWithoutProperties2["default"])(_ref, ["id"]);
      return _models.ConfigKey.update((0, _objectSpread2["default"])({}, scr), {
        where: {
          id: id
        }
      });
    })).then(function (rslts) {
      if (!returnUpdated) return done(null, {
        rslts: rslts
      });

      _models.ConfigKey.findAll({
        where: {
          id: configKeys.map(function (scr) {
            return scr.id;
          })
        }
      }).then(function (configKeys) {
        return done(null, {
          configKeys: configKeys
        });
      })["catch"](done);

      return null;
    })["catch"](done);
  };
};