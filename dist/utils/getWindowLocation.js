"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default() {
  var loc = global.window.location;

  if (!loc.origin) {
    loc.origin = "".concat(loc.protocol, "//").concat(loc.hostname).concat(loc.port ? ":".concat(loc.port) : '');
  }

  return loc;
};

exports["default"] = _default;