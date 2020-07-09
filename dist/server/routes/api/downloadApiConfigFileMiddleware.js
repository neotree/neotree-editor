"use strict";

var _models = require("../../models");

module.exports = function () {
  return function (req, res) {
    var host = "".concat(req.protocol, "://").concat(req.headers.host);
    var api_endpoint = "".concat(host, "/api");

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

      var filename = 'neotree-webeditor-api.json';
      var mimetype = 'application/json';
      res.setHeader('Content-disposition', "attachment; filename=".concat(filename));
      res.setHeader('Content-type', mimetype);
      res.json({
        host: host,
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