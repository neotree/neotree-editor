"use strict";

var _models = require("../../models");

module.exports = function () {
  return function (req, res, next) {
    var apiKey = req.body.apiKey;

    var getRandString = function getRandString() {
      return Math.random().toString(36).substring(2).toUpperCase();
    };

    var key = "".concat(getRandString()).concat(getRandString()).concat(getRandString());

    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };

    (apiKey ? _models.ApiKey.update({
      key: key
    }, {
      where: {
        id: apiKey.id
      },
      individualHooks: true
    }) : _models.ApiKey.create({
      key: key
    })).then(function (apiKey) {
      return done(null, {
        apiKey: apiKey
      });
    })["catch"](done);
  };
};