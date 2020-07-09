/*eslint-disable no-console*/
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  log: (...args) => !isProd && console.log(...args),
  error: (...args) => !isProd && console.error(...args)
};
