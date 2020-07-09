"use strict";

/*eslint-disable no-console*/
var isProd = process.env.NODE_ENV === 'production';
module.exports = {
  log: function log() {
    var _console;

    return !isProd && (_console = console).log.apply(_console, arguments);
  },
  error: function error() {
    var _console2;

    return !isProd && (_console2 = console).error.apply(_console2, arguments);
  }
};