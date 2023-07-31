"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = encryptPassword;
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};
function encryptPassword(password) {
  return new Promise(function (resolve, reject) {
    _bcryptjs["default"].genSalt(10, function (err, salt) {
      if (err) return reject(err);
      _bcryptjs["default"].hash(password, salt, function (err, encryptedPassword) {
        if (err) return reject(err);
        resolve(encryptedPassword);
      });
    });
  });
}
;
(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;
  if (!reactHotLoader) {
    return;
  }
  reactHotLoader.register(encryptPassword, "encryptPassword", "/home/farai/Workbench/neotree-editor/server/utils/encryptPassword.js");
})();
;
(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();