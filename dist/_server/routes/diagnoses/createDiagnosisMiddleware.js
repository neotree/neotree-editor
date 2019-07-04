"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var payload = req.body;

    var done = function done(err, diagnosis) {
      res.locals.setResponse(err, {
        diagnosis: diagnosis
      });
      next();
      return null;
    };

    _models.Diagnosis.create(payload).then(function (diagnosis) {
      return done(null, diagnosis);
    })["catch"](done);
  };
};