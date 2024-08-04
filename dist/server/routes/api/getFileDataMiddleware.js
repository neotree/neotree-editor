"use strict";

var _database = require("../../database");
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
module.exports = function () {
  return function (req, res, next) {
    var done = function done(e, payload) {
      res.locals.setResponse(e, payload);
      next();
    };
    _database.File.findAll({
      where: {
        id: req.params.fileId
      },
      attributes: ['id', 'filename', 'content_type', 'size', 'metadata', 'data']
    }).then(function (files) {
      return done(null, {
        file: files[0] || null
      });
    })["catch"](done);
  };
};