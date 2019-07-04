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

    var done = function done(err, script) {
      res.locals.setResponse(err, {
        script: script
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required script "id" is not provided.'
    });

    _models.Script.findOne({
      where: {
        id: id
      }
    }).then(function (s) {
      if (!s) return done({
        msg: "Could not find script with \"id\" ".concat(id, ".")
      });
      s.update(payload).then(function (script) {
        return done(null, script);
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};