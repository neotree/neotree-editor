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

import Immutable, { Record } from 'immutable';

import {
    RECEIVE_CONFIG_KEYS,
    RECEIVE_SCREENS,
    RECEIVE_SCRIPTS,
    RECEIVE_USERS
} from 'actions/datastore'

export const DatastoreState = new Record({
    configKeys: null,
    screens: null,
    scripts: null,
    users: null
});

export function datastore(state = new DatastoreState(), payload) {
    switch (payload.type) {
        case RECEIVE_CONFIG_KEYS:
            if (!payload.value) {
                return state.merge({
                    configKeys: null
                });
            }
            var configKeys = Immutable.Map(payload.value);
            return state.merge({
                configKeys: configKeys
            });
        case RECEIVE_SCREENS:
            if (!payload.value) {
                return state.merge({
                    screens: null
                });
            }
            var screens = Immutable.Map(payload.value);
            return state.merge({
                screens: screens
            });
        case RECEIVE_SCRIPTS:
            if (!payload.value) {
                return state.merge({
                    scripts: null
                });
            }
            var scripts = Immutable.Map(payload.value);
            return state.merge({
                scripts: scripts
            });
        case RECEIVE_USERS:
            if (!payload.value) {
                return state.merge({
                    users: null
                });
            }
            var users = Immutable.Map(payload.value);
            return state.merge({
                users: users
            });
        default:
            return state;
    }
}
