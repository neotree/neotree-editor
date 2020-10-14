"use strict";

/*eslint-disable no-console*/
var clc = require('cli-color');

var isProd = process.env.NODE_ENV === 'production';

var logger = function logger(opts) {
  if (opts.debug && isProd) return;
  var _logger = console[opts.error ? 'error' : 'log']; // eslint-disable-line

  var appSlug = process.env.APP_SLUG ? "[".concat(process.env.APP_SLUG, "]: ") : '';

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  _logger.apply(void 0, [appSlug ? opts.debug ? clc.red(appSlug) : clc.blue(appSlug) : ''].concat(args));
};

module.exports = {
  log: function log() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return logger.apply(void 0, [{}].concat(args));
  },
  error: function error() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return logger.apply(void 0, [{
      error: true
    }].concat(args));
  },
  debug: {
    log: function log() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return logger.apply(void 0, [{
        debug: true
      }].concat(args));
    },
    error: function error() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return logger.apply(void 0, [{
        debug: true,
        error: true
      }].concat(args));
    }
  }
};