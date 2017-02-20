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

import 'babel-polyfill';
import 'global.css';

import React from 'react';
import { render } from 'react-dom';
import { hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import { checkAuthentication } from 'actions/authentication';
import { initDatastore } from 'actions/datastore';
import { firebaseConfig } from './config'

import firebase from 'firebase';
import configureStore from 'store/configureStore';

import Root from 'containers/Root';

const store = configureStore();
const dispatch = store.dispatch;
const history = syncHistoryWithStore(hashHistory, store);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Check if user is authenticated
const target = document.getElementById('root');
checkAuthentication(dispatch)
    .then(() => {
        dispatch(initDatastore());
        render(<Root history={history} store={store}  />, target);
    })
    .catch(error => {
        console.error(error)
    });
