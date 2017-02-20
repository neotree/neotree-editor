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

import React from 'react';
import { Route, IndexRoute, IndexRedirect, Redirect } from 'react-router';

import Application from './containers/Application';
import AdminPasswordPage from './containers/AdminPasswordPage';
import AdminPasswordForm from './components/adminpassword/AdminPasswordForm';
import Authenticated from './containers/Authenticated';
import ConfigKeyList from './components/configkeys/ConfigKeyList';
import ConfigKeysPage from './containers/ConfigKeysPage'
import Dashboard from './containers/Dashboard';
import DiagnosisEdit from './components/diagnosis/DiagnosisEdit'
import LoginPage from './containers/LoginPage';
import NotFoundPage from './containers/NotFoundPage';
import ImagesPage from './containers/ImagesPage';
import ImagesList from './components/images/ImagesList';
import ScriptsPage from './containers/ScriptsPage';
import ScreenEdit from './components/screens/ScreenEdit';
import ScriptEdit from './components/scripts/ScriptEdit';
import ScriptsList from './components/scripts/ScriptsList';
import UsersPage from './containers/UsersPage';
import UserEdit from './components/users/UserEdit';
import UsersList from './components/users/UsersList';

export default (
    <Route path='/' component={Application}>
        <Route path="login" component={LoginPage} />
        <Route component={Authenticated}>
            <Route component={Dashboard}>
                <IndexRedirect to="/scripts" />

                <Route path="configkeys" component={ConfigKeysPage}>
                    <IndexRoute component={ConfigKeyList} />
                </Route>

                <Route path="images" component={ImagesPage} >
                    <IndexRoute component={ImagesList} />
                </Route>

                <Route path="scripts" component={ScriptsPage}>
                    <IndexRoute component={ScriptsList} />
                    <Route path=":scriptId/screens/:screenId" component={ScreenEdit} />
                    <Route path=":scriptId/diagnosis/:diagnosisId" component={DiagnosisEdit} />
                    <Route path=":scriptId" component={ScriptEdit} />
                </Route>

                <Route path="adminpassword" component={AdminPasswordPage}>
                    <IndexRoute component={AdminPasswordForm} />
                </Route>

                {/*<Route path="users" component={UsersPage}>*/}
                {/*<IndexRoute component={UsersList} />*/}
                {/*<Route path=":userId" component={UserEdit} />*/}
                {/*</Route>*/}
            </Route>
        </Route>
        <Route path="*" component={NotFoundPage} />
    </Route>
);
