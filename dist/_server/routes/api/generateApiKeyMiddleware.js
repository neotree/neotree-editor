"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function (app) {
  return function (req, res, next) {
    var apiKey = req.body.apiKey;
    var key = app.getRandomString();

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