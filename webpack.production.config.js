/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import webpack from 'webpack';
import base from './webpack.config.base';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production')
};

export default {
  mode: 'production',
  // devtool: 'source-map',
  context: path.resolve(__dirname, 'dist/src'),
  target: 'web',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist/src'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: { contentBase: path.resolve(__dirname, 'dist/src') },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),
    // new ExtractTextPlugin('style.css', { allChunks: false })
    // new UglifyJsPlugin()
  ],
  ...base
};
