"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = encryptPassword;

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

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