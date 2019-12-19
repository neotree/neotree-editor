const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  module.exports = require('./configureStore.prod');
} else {
  module.exports = require('./configureStore.dev');
}
