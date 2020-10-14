"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(string) {
  var joinWith = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ' ';
  return string.replace(/([a-z0-9])([A-Z])/g, "$1".concat(joinWith, "$2"));
};

exports["default"] = _default;