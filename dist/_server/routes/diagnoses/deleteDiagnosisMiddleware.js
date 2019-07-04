"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var id = req.body.id;

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
        msg: "Could not find script with \"id\" ".concat(id, ".")
      });
      s.destroy({
        where: {
          id: id
        }
      }).then(function (deleted) {
        return done(null, {
          deleted: deleted
        });
      })["catch"](done);
      return null;
    })["catch"](done);
  };
};