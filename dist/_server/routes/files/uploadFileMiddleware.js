"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _multer = _interopRequireDefault(require("multer"));

var _uuidv = _interopRequireDefault(require("uuidv4"));

var _models = require("../../models");

(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

var storage = _multer["default"].memoryStorage();

var upload = (0, _multer["default"])({
  storage: storage
});

module.exports = function (router, app) {
  var responseMiddleware = app.responseMiddleware;
  router.post('/upload-file', upload.single('file'), function (req, res, next) {
    var f = req.file;
    var fileId = (0, _uuidv["default"])();

    var done = function done(err, file) {
      res.locals.setResponse(err, {
        file: file
      });
      next();
      return null;
    };

    _models.File.create({
      id: fileId,
      filename: f.originalname,
      content_type: f.mimetype,
      size: f.size,
      data: f.buffer,
      uploaded_by: req.user ? req.user.id : null
    }).then(function () {
      _models.File.findOne({
        where: {
          id: fileId
        },
        attributes: ['id', 'filename', 'content_type', 'size', 'createdAt', 'updatedAt']
      }).then(function (_ref) {
        var file = _ref.file;
        return done(null, file);
      })["catch"](done);
    })["catch"](done);
  }, responseMiddleware);
  return router;
};

;

(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(storage, "storage", "/home/bws/WorkBench/neotree-editor/_server/routes/files/uploadFileMiddleware.js");
  reactHotLoader.register(upload, "upload", "/home/bws/WorkBench/neotree-editor/_server/routes/files/uploadFileMiddleware.js");
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();