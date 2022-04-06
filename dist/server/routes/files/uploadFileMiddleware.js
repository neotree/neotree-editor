"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

var _multer = _interopRequireDefault(require("multer"));

var _uuidv = require("uuidv4");

var _database = require("../../database");

var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/files"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
      id: (0, _uuidv.uuid)(),
      filename: f.originalname,
      content_type: f.mimetype,
      size: f.size,
      data: f.buffer // uploaded_by: req.user ? req.user.id : null

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

  reactHotLoader.register(storage, "storage", "/home/farai/Workbench/neotree-editor/server/routes/files/uploadFileMiddleware.js");
  reactHotLoader.register(upload, "upload", "/home/farai/Workbench/neotree-editor/server/routes/files/uploadFileMiddleware.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();