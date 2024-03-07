"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _sequelize = _interopRequireDefault(require("sequelize"));
var _sequelize2 = _interopRequireDefault(require("./sequelize"));
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
var Session = _sequelize2["default"].define('session', {
  sid: {
    type: _sequelize["default"].STRING,
    primaryKey: true
  },
  userId: _sequelize["default"].STRING,
  expires: _sequelize["default"].DATE,
  data: _sequelize["default"].STRING(50000)
});
var _default = Session;
var _default2 = exports["default"] = _default;
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(Session, "Session", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/database/models/_Session.js");
  reactHotLoader.register(_default, "default", "/Users/lafarai/WorkBench/BWS/neotree-editor/server/database/models/_Session.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();