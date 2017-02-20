/*
 * The MIT License (MIT)
 * Copyright (c) 2016 Ubiqueworks Ltd and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
 * SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/* eslint max-len: 0 */
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import path from 'path';
import merge from 'webpack-merge';
import webpack from 'webpack';

import baseConfig from './webpack.config.base';

export default merge(baseConfig, {
    debug: true,

    devtool: 'cheap-module-eval-source-map',

    entry: [
        'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
        path.resolve(__dirname, '../node_modules/react-mdl/extra/material.js'),
        path.resolve(__dirname, '../src/index.jsx')
    ],

    output: {
        publicPath: 'http://localhost:3000/dist/',
        filename: "neotree.js"
    },

    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style", "css?sourceMap")
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin('neotree.css', { allChunks: true }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        // }),
        // new CopyWebpackPlugin([
        //     { from: path.resolve(__dirname, 'index.development.html'), to: 'index.html', force: true },
        // ], {
        //     copyUnmodified: true
        })
    ],

    target: 'electron-renderer'
});
