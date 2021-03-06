"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _stream = _interopRequireDefault(require("stream"));

var _database = require("../../database");

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/files"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var router = _express["default"].Router();

module.exports = function (app) {
  router = require('./uploadFileMiddleware')(router, app);
  router.get(endpoints.GET_FILE, function (req, res) {
    _database.File.findOne({
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

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(router, "router", "/home/farai/WorkBench/neotree-editor/server/routes/files/index.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();