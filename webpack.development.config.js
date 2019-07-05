/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import webpack from 'webpack';
import base from './webpack.config.base';

const config = require('./_config/config.development.json');

export default {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  context: path.resolve(__dirname, './src'),
  target: 'web',
  entry: [
    'eventsource-polyfill', // necessary for hot reloading with IE
    `webpack-hot-middleware/client?reload=true&path=${config.host}/__webpack_hmr`, //note that it reloads the page if hot module reloading fails.
    './index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: `${config.host}/`,
    filename: 'bundle.js'
  },
  devServer: { contentBase: path.resolve(__dirname, 'src'), hot: true },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin()
  ],
  ...base(config)
};
