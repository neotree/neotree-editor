/*eslint-disable no-console*/
const clc = require('cli-color');

const isProd = process.env.NODE_ENV === 'production';

const logger = (opts, ...args) => {
  if (opts.debug && isProd) return;
  const _logger = console[opts.error ? 'error' : 'log']; // eslint-disable-line
  const appSlug = process.env.APP_SLUG ? `[${process.env.APP_SLUG}]: ` : '';
  _logger(appSlug ? (opts.debug ? clc.red(appSlug) : clc.blue(appSlug)) : '', ...args);
};

module.exports = {
  log: (...args) => logger({}, ...args),
  error: (...args) => logger({ error: true, }, ...args),
  debug: {
    log: (...args) => logger({ debug: true, }, ...args),
    error: (...args) => logger({ debug: true, error: true, }, ...args),
  },
};

