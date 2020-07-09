"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _stream = _interopRequireDefault(require("stream"));

var _models = require("../../models");

var router = _express["default"].Router();

module.exports = function (app) {
  // const { responseMiddleware } = app;
  router = require('./uploadFileMiddleware')(router, app);
  router.get('/file/:fileId', function (req, res) {
    _models.File.findOne({
      where: {
        id: req.params.fileId
      }
    })["catch"](function (e) {
      return res.json({
        error: e
      });
    }).then(function (file) {
      var fileContents = Buffer.from(file.data, 'base64');
      var readStream = new _stream["default"].PassThrough();
      readStream.end(fileContents); // res.set('Content-disposition', `attachment; filename=${file.filename}`);
      // res.set('Content-Type', file.content_type);

      readStream.pipe(res);
    });
  });
  return router;
};