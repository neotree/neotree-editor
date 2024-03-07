"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _express = _interopRequireDefault(require("express"));
var _stream = _interopRequireDefault(require("stream"));
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
      readStream.end(fileContents);

      // res.set('Content-disposition', `attachment; filename=${file.filename}`);
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
  reactHotLoader.register(router, "router", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/routes/files/index.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();