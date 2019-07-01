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

import path from 'path';

const srcRoot = path.join(__dirname, "../src");

export default {
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loaders: ['babel-loader'],
            exclude: /node_modules/
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }, {
            test: /\.svg$/,
            loader: 'url?limit=65000&mimetype=image/svg+xml&name=fonts/[name].[ext]'
        }, {
            test: /\.woff$/,
            loader: 'url?limit=65536&mimetype=application/font-woff&name=fonts/[name].[ext]'
        }, {
            test: /\.woff2$/,
            loader: 'url?limit=65536&mimetype=application/font-woff2&name=fonts/[name].[ext]'
        }, {
            test: /\.[ot]tf$/,
            loader: 'url?limit=65536&mimetype=application/octet-stream&name=fonts/[name].[ext]'
        }, {
            test: /\.eot$/,
            loader: 'url?limit=65536&mimetype=application/vnd.ms-fontobject&name=fonts/[name].[ext]'
        }]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.json'],
        packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
        root: [srcRoot],
        modulesDirectories: [
            'node_modules', path.join(__dirname, '../node_modules')
        ]
    },
    plugins: [],
    externals: [
        // put your node 3rd party libraries which can't be built with webpack here
        // (mysql, mongodb, and so on..)
    ]
};
