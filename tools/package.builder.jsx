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

/* eslint strict: 0, no-shadow: 0, no-unused-vars: 0, no-console: 0 */
'use strict';

require('babel-polyfill');

const builder = require("electron-builder");
const del = require('del');
const packageJson = require("../package.json");
const path = require('path');
const webpack = require('webpack');
const webpackElectron = require('./webpack.config.electron');
const webpackProduction = require('./webpack.config.production');

const Platform = builder.Platform;

const appDir = path.resolve(__dirname, "../app");
const distDir = path.resolve(__dirname, "../dist");
const resourcesDir = path.resolve(__dirname, "../tools/resources");

function startPack() {
    console.log('start pack...');
    del(appDir);

    webpackBuild(webpackProduction)
        .then(() => webpackBuild(webpackElectron))
        .then(() => del(distDir))
        .then(() => buildPackage())
        .catch(err => {
            console.error(err);
        });
}

function webpackBuild(config) {
    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err) return reject(err);
            resolve(stats);
        });
    });
}

function buildPackage() {
    var config = Object.keys(packageJson);
    config.directories = {
        "app": appDir,
        "output": distDir,
        "build": resourcesDir,
    };

    console.error(JSON.stringify(config, null, 2));
    return builder.build({
        targets: Platform.MAC.createTarget(),
        config: config
    });
}

// Start the build
startPack();
