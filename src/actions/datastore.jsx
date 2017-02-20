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

import bcrypt from 'bcryptjs';
import firebase from 'firebase';
import { firebaseConfig } from '../config';
import { syncFirebaseArray } from '../utils';

var database;
var detachedAuth;
var firebaseAuth;
var firebaseRef;

/* Constants */
export const RECEIVE_CONFIG_KEYS = 'RECEIVE_CONFIG_KEYS';
export const RECEIVE_DIAGNOSIS = 'RECEIVE_DIAGNOSIS';
export const RECEIVE_SCREENS = 'RECEIVE_SCREENS';
export const RECEIVE_SCRIPTS = 'RECEIVE_SCRIPTS';
export const RECEIVE_USERS = 'RECEIVE_USERS';

/* Initialize datastore */
export function initDatastore() {
    return (dispatch) => {
        dispatch(listenToConfigKeyChanges());
        dispatch(listenToScreensChanges());
        dispatch(listenToDiagnosisChanges());
        dispatch(listenToScriptsChanges());
        dispatch(listenToUsersChanges());
    };
}

function initFirebase() {
    if (!database) {
        // This is dumb, but required as Firebase 3.x automatically logs in a newly created user...
        // see http://stackoverflow.com/questions/37553362/firebase-create-user-manually
        var detachedFirebaseApp = firebase.initializeApp(firebaseConfig, 'authApp');
        detachedAuth = detachedFirebaseApp.auth();

        database = firebase.database();
        firebaseAuth = firebase.auth();
        firebaseRef = database.ref();
    }
}

function listenToConfigKeyChanges() {
    return (dispatch) => {
        initFirebase();

        firebaseRef.child('configkeys').on('value', (snapshot) => {
            dispatch(receiveConfigKeys(snapshot.val()));
        });
    };
}

function receiveConfigKeys(configKeys) {
    return {
        type: RECEIVE_CONFIG_KEYS,
        value: configKeys
    };
}

function listenToScreensChanges() {
    return (dispatch) => {
        initFirebase();

        firebaseRef.child('screens').on('value', (snapshot) => {
            dispatch(receiveScreens(snapshot.val()));
        });
    };
}

function receiveScreens(screens) {
    return {
        type: RECEIVE_SCREENS,
        value: screens
    };
}

function listenToDiagnosisChanges() {
    return (dispatch) => {
        initFirebase();

        firebaseRef.child('diagnosis').on('value', (snapshot) => {
            dispatch(receiveDiagnosis(snapshot.val()));
        });
    };
}

function receiveDiagnosis(diagnosis) {
    return {
        type: RECEIVE_DIAGNOSIS,
        value: diagnosis
    };
}

function listenToScriptsChanges() {
    return (dispatch) => {
        initFirebase();

        database.ref('scripts').on('value', (snapshot) => {
            dispatch(receiveScripts(snapshot.val()));
        });
    };
}

function receiveScripts(scripts) {
    return {
        type: RECEIVE_SCRIPTS,
        value: scripts
    };
}

function listenToUsersChanges() {
    return (dispatch) => {
        initFirebase();

        database.ref('users').on('value', (snapshot) => {
            dispatch(receiveUsers(snapshot.val()));
        });
    };
}

function receiveUsers(users) {
    return {
        type: RECEIVE_USERS,
        value: users
    };
}

/* Manage users */
export function createUser(email, password, firstName, middleName, lastName, location) {
    initFirebase();

    // MUST use detachedAuth!!!
    return detachedAuth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            return detachedAuth.signOut();
        })
        .then(() => {
            var userId = firebaseRef.child('users').push().key;
            return database.ref('users/' + userId).set({
                userId : userId,
                email: email,
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                location: location,
                source: 'editor',
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        });
}

export function updateUser(userId, firstName, middleName, lastName, location) {
    initFirebase();

    return database.ref('users/' + userId).update({
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        location: location,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
}

export function fetchUser(userId) {
    initFirebase();

    return new Promise(function(resolve, reject) {
        database.ref('users/' + userId).once('value', function(data) {
            if (data) {
                resolve(data.val());
            } else {
                reject(new Error('Error retrieving user with id: ' + userId));
            }
        });
    });
}

export function deleteUser(userId) {
    initFirebase();
    // Damn Firebase and authentication management... we delete the app record, but it is not possible to
    // remove the actual email/password account
    return database.ref('users/' + userId).remove();
}

export function resetUserPassword(email) {
    initFirebase();
//    return database.ref('users/' + userId).remove();
}


/* Manage scripts */
export function createScript(title, description) {
    initFirebase();
    var scriptId = database.ref('scripts').push().key;
    return database.ref('scripts/' + scriptId).set({
        scriptId : (scriptId) ? scriptId : null,
        title: (title) ? title : null,
        description: (description) ? description : null,
        source: 'editor',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    });
};

export function updateScript(scriptId, title, description) {
    initFirebase();
    return database.ref('scripts/' + scriptId).update({
        title: (title) ? title : null,
        description: (description) ? description : null,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
};

export function fetchScript(scriptId) {
    initFirebase();

    return new Promise(function(resolve, reject) {
        database.ref('scripts/' + scriptId).once('value', function(data) {
            if (data) {
                resolve(data.val());
            } else {
                reject(new Error('Error retrieving script with id: ' + scriptId));
            }
        });
    });
};

export function deleteScript(scriptId) {
    console.log("Deleting script with id: " + scriptId);
    initFirebase();
    return database.ref('scripts/' + scriptId).remove();
}

/* Manage screens */
export function createScreen(scriptId, type, position) {
    initFirebase();
    var screenId = database.ref('screens/' + scriptId).push().key;
    return database.ref('screens/' + scriptId + '/' + screenId).set({
        screenId: screenId,
        type: (type) ? type : null,
        position: (position) ? position : null,
        source: 'editor',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => screenId);
}

export function fetchScreen(scriptId, screenId) {
    initFirebase();

    return new Promise(function(resolve, reject) {
        console.log('Fetching screen with id: ' + scriptId + ' | ' + screenId);

        database.ref('screens/' + scriptId + '/' + screenId).once('value', function(data) {
            if (data) {
                resolve(data.val());
            } else {
                reject(new Error('Error retrieving screen with id: ' + scriptId + ' | ' + screenId));
            }
        });
    });
}

export function updateScreen(scriptId, screenId, epicId, storyId, refId, step, title, sectionTitle, actionText, contentText, infoText, notes, condition, skippable, metadata) {
    initFirebase();
    return database.ref('screens/' + scriptId + '/' + screenId).update({
        screenId: screenId,
        epicId: (epicId) ? epicId : null,
        storyId: (storyId) ? storyId : null,
        refId: (refId) ? refId : null,
        step: (step) ? step : null,
        title: (title) ? title : null,
        sectionTitle: (sectionTitle) ? sectionTitle : null,
        actionText: (actionText) ? actionText : null,
        contentText: (contentText) ? contentText : null,
        infoText: (infoText) ? infoText : null,
        notes: (notes) ? notes : null,
        condition: (condition) ? condition : null,
        skippable: (skippable) ? skippable : null,
        metadata: (metadata) ? metadata : null,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
}

export function updateScreenOrder(scriptId, screens) {
    var updates = {};

    if (screens) {
        screens.map((value, index) => {
            // console.log("[id=" + value.screenId + "title=" + value.title + ", oldPos=" + value.position + ", newPos=" + (index + 1) + "]");
            // delete value.$id;
            // value.position = index + 1;
           updates['screens/' + scriptId + '/' + value.screenId + "/position"] = index + 1;
        });
    }

    // console.log(JSON.stringify(updates, null, 2));
    return database.ref().update(updates);
}

export function deleteScreen(scriptId, screenId) {
    initFirebase();
    return database.ref('screens/' + scriptId + '/' + screenId).remove();
}

export function subscribeScreenChanges(scriptId, callback) {
    return syncFirebaseArray(database.ref('screens/' + scriptId).orderByChild('position'), callback);
}

export function unsubscribeScreenChanges(scriptId) {
    return database.ref('screens/' + scriptId).off();
}

/* Manage diagnosis */
export function createDiagnosis(scriptId, name, description) {
    initFirebase();
    var diagnosisId = database.ref('diagnosis/' + scriptId).push().key;
    return database.ref('diagnosis/' + scriptId + '/' + diagnosisId).set({
        diagnosisId: diagnosisId,
        name: (name) ? name : null,
        description: (description) ? description : null,
        source: 'editor',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => diagnosisId);
}

export function fetchDiagnosis(scriptId, diagnosisId) {
    initFirebase();

    return new Promise(function(resolve, reject) {
        console.log('Fetching diagnosis with id: ' + scriptId + ' | ' + diagnosisId);

        database.ref('diagnosis/' + scriptId + '/' + diagnosisId).once('value', function(data) {
            if (data) {
                resolve(data.val());
            } else {
                reject(new Error('Error retrieving diagnosis with id: ' + scriptId + ' | ' + screenId));
            }
        });
    });
}

export function updateDiagnosis(scriptId, diagnosisId, name, description, expression, text1, image1, text2, image2, text3, image3, symptoms) {
    initFirebase();
    return database.ref('diagnosis/' + scriptId + '/' + diagnosisId).update({
        diagnosisId: diagnosisId,
        name: (name) ? name : null,
        description: (description) ? description : null,
        expression: (expression) ? expression : null,
        text1: (text1) ? text1 : null,
        image1: (image1) ? image1 : null,
        text2: (text2) ? text2 : null,
        image2: (image2) ? image2 : null,
        text3: (text3) ? text3 : null,
        image3: (image3) ? image3 : null,
        symptoms: (symptoms) ? symptoms : null,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
}

export function deleteDiagnosis(scriptId, diagnosisId) {
    initFirebase();
    return database.ref('diagnosis/' + scriptId + '/' + diagnosisId).remove();
}

export function subscribeDiagnosisChanges(scriptId, callback) {
    return syncFirebaseArray(database.ref('diagnosis/' + scriptId), callback);
}

export function unsubscribeDiagnosisChanges(scriptId) {
    return database.ref('diagnosis/' + scriptId).off();
}


/* Manage admin password */
// export function fetchAdminPassword(userId) {
//     initFirebase();
//
//     return new Promise(function(resolve, reject) {
//         database.ref('adminpassword').once('value', function(data) {
//             if (data) {
//                 resolve(data.val());
//             } else {
//                 reject(new Error('Error retrieving admin password'));
//             }
//         });
//     });
// }

export function updateAdminPassword(password) {
    initFirebase();

    return database.ref('adminpassword').update({
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
}

/* Manage config keys */
export function createConfigKey(key, label, summary) {
    initFirebase();
    var configKeyId = database.ref('configkeys').push().key;
    return database.ref('configkeys/' + configKeyId).set({
        configKeyId: (configKeyId) ? configKeyId : null,
        configKey: (key) ? key : null,
        label: (label) ? label : null,
        summary: (summary) ? summary : null,
        source: 'editor',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    });
}

export function deleteConfigKey(configKeyId) {
    initFirebase();
    return database.ref('configkeys/' + configKeyId).remove();
}

export function subscribeConfigKeyChanges(callback) {
    return syncFirebaseArray(database.ref('configkeys'), callback);
}

export function unsubscribeConfigKeyChanges() {
    return database.ref('configkeys').off();
}
