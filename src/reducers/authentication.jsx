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

import { Record } from 'immutable';

import {
    INIT_AUTH,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT_SUCCESS,
    LOGOUT_FAILURE
} from 'actions/authentication'

export const AuthState = new Record({
    authenticated: false,
    userId: null
});

export function auth(state = new AuthState(), payload) {
    // console.log('AUTH REDUCER(' + payload.type + ')');
    // console.log(JSON.stringify(payload, null, 2));
    switch (payload.type) {
        case INIT_AUTH:
        case LOGIN_SUCCESS:
            return state.merge({
                authenticated: !!payload.user,
                userId: payload ? payload.user.uid : null
            });
        case LOGIN_FAILURE:
            return state.merge({
                authenticated: false,
                userId: null
            });
        case LOGOUT_FAILURE:
        case LOGOUT_SUCCESS:
            return new AuthState();
        default:
            return state;
    }
}
