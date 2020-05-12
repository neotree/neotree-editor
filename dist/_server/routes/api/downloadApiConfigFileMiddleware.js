"use strict";

var _models = require("../../models");

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

module.exports = function () {
  return function (req, res) {
    var api_endpoint = "".concat(req.protocol, "://").concat(req.headers.host, "/api");

    var done = function done(e, apiKey) {
      res.locals.setResponse(e);
      if (e || !apiKey) return res.json({
        error: e || {
          msg: 'Failed to get the api key'
        }
      }); // const json = JSON.stringify(JSON.stringify({
      //   api_endpoint,
      //   api_key: apiKey.key
      // }, null, 4));

      var filename = 'api.config.json';
      var mimetype = 'application/json';
      res.setHeader('Content-disposition', "attachment; filename=".concat(filename));
      res.setHeader('Content-type', mimetype);
      res.json({
        api_endpoint: api_endpoint,
        api_key: apiKey.key
      });
    };

    _models.ApiKey.findOne({
      where: {}
    }).then(function (apiKey) {
      return done(null, apiKey);
    })["catch"](done);
  };
};