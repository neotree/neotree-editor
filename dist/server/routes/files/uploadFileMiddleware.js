"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _multer = _interopRequireDefault(require("multer"));
var _uuidv = require("uuidv4");
var _database = require("../../database");
var endpoints = _interopRequireWildcard(require("../../../constants/api-endpoints/files"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
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
      data: f.buffer
      // uploaded_by: req.user ? req.user.id : null
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
  reactHotLoader.register(storage, "storage", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/files/uploadFileMiddleware.js");
  reactHotLoader.register(upload, "upload", "/Users/lafarai/Werq/BWS/NeoTree/neotree-editor/server/routes/files/uploadFileMiddleware.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();