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

import firebase from 'firebase';
import { push } from 'react-router-redux'

/* Initialize authentication */
export const INIT_AUTH = 'INIT_AUTH';

export function checkAuthentication(dispatch) {
    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    // User is signed in.
                    dispatch(initAuth(user))
                    dispatch(push('/'));
                } else {
                    // No user is signed in.
                    dispatch(logout());
                }
                resolve();
                unsubscribe();
            },
            error => reject(error)
        );
    });
};

function initAuth(payload) {
    return {
        type: INIT_AUTH,
        user: payload
    };
}

/* Login actions */
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export function login(credentials, redirectTo = "/") {
    return dispatch => {
        // Login
        return firebase.auth()
            .signInWithEmailAndPassword(credentials.username, credentials.password)
            .then(result => {
                dispatch(receiveLoginSuccess(result));
                dispatch(push(redirectTo));
            })
            .catch(error => {
                dispatch(receiveLoginError(error));
            });
    };
}

function receiveLoginSuccess(payload) {
    return {
        type: LOGIN_SUCCESS,
        user: payload
    };
}

function receiveLoginError(error) {
    return dispatch => {
        dispatch(push("/login?err=" + encodeURIComponent(error.message)));
        return {
            type: LOGIN_FAILURE
        }
    };
}

/* Logout actions */
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

export function logout() {
    return dispatch => {
        // Logout
        return firebase.auth()
            .signOut()
            .then(result => {
                dispatch(receiveLogoutSuccess(result));
            })
            .catch(error => {
                dispatch(receiveLogoutError(error));
            });
    }
}

function receiveLogoutSuccess(result) {
    return dispatch => {
        dispatch(push("/login"));
        return {
            type: LOGOUT_SUCCESS
        }
    }
}

function receiveLogoutError(error) {
    return dispatch => {
        dispatch(push("/login"));
        return {
            type: LOGOUT_FAILURE
        }
    }
}
