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

/* Authentication */
export function isAuthenticated(store) {
    const { auth } = store.getState();
    if (auth && auth.authenticated) {
        // TODO: Re-authenticate here if the user is not null to refresh tokens, etc.
        return true;
    }
    return false;
}

/* Firebase */
export function syncFirebaseArray(ref, callback) {
    var list = [];

    ref.on('child_added', (snap, prevChild) => {
        // console.log("sync: child_added");

        var data = snap.val();
        data.$id = snap.key; // assumes data is always an object

        var pos = positionAfter(list, prevChild);
        list.splice(pos, 0, data);

        callback(list);
    });


    ref.on('child_removed', (snap) => {
        // console.log("sync: child_removed");

        var i = positionFor(list, snap.key);
        if (i > -1) {
            list.splice(i, 1);
        }

        callback(list);
    });

    ref.on('child_changed', (snap) => {
        // console.log("sync: child_changed");

        var i = positionFor(list, snap.key);
        if (i > -1) {
            list[i] = snap.val();
            list[i].$id = snap.key; // assumes data is always an object
        }

        callback(list);
    });

    ref.on('child_moved', (snap, prevChild) => {
        // console.log("sync: child_moved");

        var curPos = positionFor(list, snap.key);
        if( curPos > -1 ) {
            var data = list.splice(curPos, 1)[0];
            var newPos = positionAfter(list, prevChild);
            list.splice(newPos, 0, data);
        }

        callback(list);
    });
}

function positionFor(list, key) {
    for(var i = 0, len = list.length; i < len; i++) {
        if( list[i].$id === key ) {
            return i;
        }
    }
    return -1;
}

function positionAfter(list, prevChild) {
    if( prevChild === null ) {
        return 0;
    } else {
        var i = positionFor(list, prevChild);
        if( i === -1 ) {
            return list.length;
        } else {
            return i+1;
        }
    }
}

/* Arrays */
export function arrayMove (array, previousIndex, newIndex) {
    if (newIndex >= array.length) {
        var k = newIndex - array.length;
        while ((k--) + 1) {
            array.push(undefined);
        }
    }
    array.splice(newIndex, 0, array.splice(previousIndex, 1)[0]);
    return array;
}