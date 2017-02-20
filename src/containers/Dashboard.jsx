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

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

import { logout } from 'actions/authentication';

import { Link } from 'react-router'

import {
    Button,
    Content,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Drawer,
    IconButton,
    Layout,
    Header,
    Navigation,
    Menu,
    MenuItem
} from 'react-mdl';

export default class Dashboard extends Component {

    static contextTypes = {
        store: React.PropTypes.object
    };

    static propTypes = {
        children: React.PropTypes.object.isRequired
    };

    static childContextTypes = {
        setToolbarTitle: React.PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {
            toolbarTitle: 'Dashboard',
            openLogoutConfirmDialog: false
        };
    }

    getChildContext () {
        const { store } = this.props;
        return {
            setToolbarTitle: this.setToolbarTitle
        }
    }

    handleLogoutClick = () => {
        const { dispatch } = this.context.store;
        dispatch(logout());
    };

    openLogoutConfirmDialog = () => {
        this.setState({
            openLogoutConfirmDialog: true
        });
    };

    closeLogoutConfirmDialog = () => {
        this.setState({
            openLogoutConfirmDialog: false
        });
    };

    setToolbarTitle = (title) => {
        this.setState({
            ...this.state,
            toolbarTitle: title
        });
    };

    toggleDrawer = () => {
        const layout = findDOMNode(this.refs.layout);
        if (layout.classList.contains('is-small-screen')) {
            layout.MaterialLayout.toggleDrawer();
        }
    };

    render() {
        const { toolbarTitle } = this.state;
        const styles = {
            container : {
                height: '100%'
            },
            content : {
                backgroundColor: '#f0f0f0',
                padding: '48px'
            }
        };

        return (
            <div style={styles.container}>
                <Layout ref="layout" fixedHeader fixedDrawer>
                    <Header title={toolbarTitle}>
                        <IconButton name="more_vert" id="actionbar-menu" />
                        <Menu target="actionbar-menu" align="right">
                            <MenuItem>Profile</MenuItem>
                            <MenuItem onClick={this.openLogoutConfirmDialog}>Sign out</MenuItem>
                        </Menu>
                    </Header>
                    <Drawer title="Neo Tree">
                        <Navigation>
                            <Link onClick={this.toggleDrawer} to="/adminpassword">Admin Password</Link>
                            <Link onClick={this.toggleDrawer} to="/configkeys">Configuration</Link>
                            {/*<Link onClick={this.toggleDrawer} to="/images">Images</Link>*/}
                            <Link onClick={this.toggleDrawer} to="/scripts">Scripts</Link>
                            {/*<Link onClick={this.toggleDrawer} to="/users">Users</Link>*/}
                        </Navigation>
                    </Drawer>
                    <Content style={styles.content}>
                        {this.props.children}
                    </Content>
                </Layout>
                <Dialog open={this.state.openLogoutConfirmDialog}>
                    <DialogTitle>Sign out</DialogTitle>
                    <DialogContent>
                        <p>You are about to sign out. All unsaved changes will be lost.</p>
                    </DialogContent>
                    <DialogActions>
                        <Button type='button' onClick={this.handleLogoutClick} accent>Sign out</Button>
                        <Button type='button' onClick={this.closeLogoutConfirmDialog}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

}
