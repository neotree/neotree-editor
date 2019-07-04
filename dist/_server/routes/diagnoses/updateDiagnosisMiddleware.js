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

    var done = function done(err, diagnosis) {
      res.locals.setResponse(err, {
        diagnosis: diagnosis
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required diagnosis "id" is not provided.'
    });

    _models.Diagnosis.findOne({
      where: {
        id: id
      }
    }).then(function (s) {
      if (!s) return done({
        msg: "Could not find diagnosis with \"id\" ".concat(id, ".")
      });
      s.update(payload).then(function (diagnosis) {
        return done(null, diagnosis);
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};