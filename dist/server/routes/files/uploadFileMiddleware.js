"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _multer = _interopRequireDefault(require("multer"));

var _database = require("../../database");

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/files"));

(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var storage = _multer["default"].memoryStorage();

var upload = (0, _multer["default"])({
  storage: storage
});

module.exports = function (router) {
  router.post(endpoints.UPLOAD_FILE, upload.single('file'), function (req, res, next) {
    var f = req.file;

    var done = function done(err, file) {
      res.locals.setResponse(err, {
        file: file
      });
      next();
      return null;
    };

    _database.File.create({
      filename: f.originalname,
      content_type: f.mimetype,
      size: f.size,
      data: f.buffer,
      uploaded_by: req.user ? req.user.id : null
    }).then(function (rslts) {
      done(null, !rslts ? null : {
        id: rslts.id,
        filename: rslts.filename,
        content_type: rslts.content_type,
        size: rslts.size,
        createdAt: rslts.createdAt,
        updatedAt: rslts.updatedAt
      });
    })["catch"](done);
  }, require('../../utils/responseMiddleware'));
  return router;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(storage, "storage", "/home/farai/WorkBench/neotree-editor/server/routes/files/uploadFileMiddleware.js");
  reactHotLoader.register(upload, "upload", "/home/farai/WorkBench/neotree-editor/server/routes/files/uploadFileMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();