const path = require('path');
const webpack = require('webpack');
const base = require('./webpack.config.base');

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  context: path.resolve(__dirname, 'src'),
  node: {
    __filename: true
  },
  target: 'web',
  entry: [
    'eventsource-polyfill', // necessary for hot reloading with IE
    'webpack-hot-middleware/client?reload=true', //note that it reloads the page if hot module reloading fails.
    './index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: { contentBase: path.resolve(__dirname, 'src'), hot: true },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin()
  ],
  ...base
};
