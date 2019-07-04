"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res, next) {
    var id = req.body.id;

    var done = function done(err, screen) {
      res.locals.setResponse(err, {
        screen: screen
      });
      next();
      return null;
    };

    if (!id) return done({
      msg: 'Required screen "id" is not provided.'
    });

    _models.Screen.findOne({
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