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

import { connect } from 'react-redux';
import { push, replace } from 'react-router-redux'

import {
    Button,
    Card,
    CardActions,
    CardTitle,
    CardText,
    DataTable,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    FABButton,
    Icon,
    IconButton,
    Menu,
    MenuItem,
    TableHeader
} from 'react-mdl';

import { deleteUser, resetUserPassword } from 'actions/datastore';

class UsersList extends Component {

    static propTypes = {
        datastore: React.PropTypes.object.isRequired
    };

    static contextTypes = {
        store: React.PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            openDeleteConfirmDialog: false,
            openResetPasswordConfirmDialog: false,
            userIdForAction: null,
            userEmailForAction: null
        };
    }

    handleAddUserClick = () => {
        const { dispatch } = this.context.store;
        dispatch(push('/users/new'));
    };

    handleEditUserClick = (userId) => {
        const { dispatch } = this.context.store;
        dispatch(push('/users/' + userId));
    };

    handleDeleteClick = () => {
        console.log('handleDeleteClick');
        const { userIdForAction } = this.state;
        deleteUser(userIdForAction)
            // .then((user) => {
            //     this.setState({
            //         ...this.state,
            //         email: user.email,
            //         firstName: user.firstName,
            //         middleName: user.middleName,
            //         lastName: user.lastName,
            //         location: user.location
            //     });
            // })
            .catch(error => {
                console.error(error)
            });
        this.closeDeleteConfirmDialog();
    };

    handleResetPasswordClick = () => {
        console.log('handleResetPasswordClick');
        // const { dispatch } = this.context.store;
        // dispatch(logout());
        this.closeResetPasswordConfirmDialog();
    };

    openResetPasswordConfirmDialog = (userId) => {
        this.setState({
            ...this.state,
            openResetPasswordConfirmDialog: true,
            userIdForAction: userId
        });
    };

    closeResetPasswordConfirmDialog = () => {
        this.setState({
            ...this.state,
            openResetPasswordConfirmDialog: false,
            userIdForAction: null
        });
    };

    openDeleteConfirmDialog = (userId) => {
        this.setState({
            ...this.state,
            openDeleteConfirmDialog: true,
            userIdForAction: userId
        });
    };

    closeDeleteConfirmDialog = () => {
        this.setState({
            ...this.state,
            openDeleteConfirmDialog: false,
            userIdForAction: null
        });
    };

    // TODO: Fix margin top to be more generic for all content
    render() {
        const styles = {
            container : {
                display: 'flex',
                boxSizing: 'border-box',
                justifyContent: 'center',
                height: '100%'
            },
            table: {
                width: '780px'
            },
            fab : {
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 900
            }
        };

        const confirmDeleteDialog = (
            <Dialog open={this.state.openDeleteConfirmDialog}>
                <DialogTitle>Delete</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this user?</p>
                </DialogContent>
                <DialogActions>
                    <Button type='button' onClick={this.handleDeleteClick} accent>Delete</Button>
                    <Button type='button' onClick={this.closeDeleteConfirmDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );

        const confirmResetPasswordDialog = (
            <Dialog open={this.state.openResetPasswordConfirmDialog}>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    <p>You are about to reset this user's password. Are you sure?</p>
                </DialogContent>
                <DialogActions>
                    <Button type='button' onClick={this.handleResetPasswordClick} accent>Reset Password</Button>
                    <Button type='button' onClick={this.closeResetPasswordConfirmDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );

        // TODO: fix buttons width
        const renderEditButton = (userId, rowData, index) => {
            //return <IconButton name="edit" onClick={this.handleEditUserClick.bind(this, userId)}/>;
            const menuId = "more-user-action-menu" + index;
            return (
                <div style={{color: "#999999"}}>
                    <div style={{position: 'relative'}}>
                        <IconButton name="edit" onClick={this.handleEditUserClick.bind(this, userId)}/>
                        <IconButton name="more_vert" id={menuId} />
                        <Menu target={menuId} align="right">
                            {/*<MenuItem onClick={this.handleEditUserClick.bind(this, userId)}>Edit user</MenuItem>*/}
                            <MenuItem onClick={this.openResetPasswordConfirmDialog.bind(this, userId)}>Reset password</MenuItem>
                            <MenuItem onClick={this.openDeleteConfirmDialog.bind(this, userId)}>Delete</MenuItem>
                        </Menu>
                    </div>
                </div>
            )
        };

        const { users } = this.props.datastore;
        // console.log(JSON.stringify(users, null, 2));

        const renderTable = (
            <div>
                <DataTable style={{width: '780px'}} shadow={0} rows={(users) ? users.toArray() : []}>
                    <TableHeader name="firstName">First name</TableHeader>
                    <TableHeader name="middleName">Middle name</TableHeader>
                    <TableHeader name="lastName">Last name</TableHeader>
                    <TableHeader name="location">Location</TableHeader>
                    <TableHeader name="email">Email</TableHeader>
                    <TableHeader name="userId" cellFormatter={renderEditButton} />
                </DataTable>
            </div>
        );

        const renderEmptyTable = (
            <Card shadow={0} style={{width: '320px'}}>
                <CardTitle>Users are unavaliable</CardTitle>
                <CardText>Add a new user to let them getting started.<br/><br/><br/></CardText>
                <CardActions border>
                    <Button onClick={this.handleAddUserClick} colored>ADD USER</Button>
                </CardActions>
            </Card>
        );

        return (
            <div>
                <FABButton style={styles.fab} colored ripple onClick={this.handleAddUserClick}>
                    <Icon name="add" />
                </FABButton>
                <div style={styles.container}>
                    {(users) ? renderTable : renderEmptyTable}
                </div>
                {confirmDeleteDialog}
                {confirmResetPasswordDialog}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { datastore } = state;
    return {
        datastore: datastore
    }
};

export default connect(mapStateToProps)(UsersList)