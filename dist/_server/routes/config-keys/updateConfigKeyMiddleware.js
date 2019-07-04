"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var _req$body = req.body,
        id = _req$body.id,
        payload = (0, _objectWithoutProperties2["default"])(_req$body, ["id"]);

    var done = function done(err, configKey) {
      res.locals.setResponse(err, {
        configKey: configKey
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required configKey "id" is not provided.'
    });

    _models.ConfigKey.findOne({
      where: {
        id: id
      }
    }).then(function (s) {
      if (!s) return done({
        msg: "Could not find configKey with \"id\" ".concat(id, ".")
      });
      s.update(payload).then(function (configKey) {
        return done(null, configKey);
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};