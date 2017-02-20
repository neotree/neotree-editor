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

import { deleteScript } from 'actions/datastore';

class ScriptsList extends Component {

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
            scriptIdForAction: null
        };
    }

    handleAddScriptClick = () => {
        const { dispatch } = this.context.store;
        dispatch(push('/scripts/new'));
    };

    handleEditScriptClick = (scriptId) => {
        const { dispatch } = this.context.store;
        dispatch(push('/scripts/' + scriptId));
    };

    handleDeleteClick = () => {
        const { scriptIdForAction } = this.state;
        deleteScript(scriptIdForAction)
            .catch(error => {
                console.error(error)
            });
        this.closeDeleteConfirmDialog();
    };

    openDeleteConfirmDialog = (scriptId) => {
        console.log("delete id: " + scriptId);
        this.setState({
            ...this.state,
            openDeleteConfirmDialog: true,
            scriptIdForAction: scriptId
        });
    };

    closeDeleteConfirmDialog = () => {
        this.setState({
            ...this.state,
            openDeleteConfirmDialog: false,
            scriptIdForAction: null
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
                width: '640px'
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
                    <p>Are you sure you want to delete this script?</p>
                </DialogContent>
                <DialogActions>
                    <Button type='button' onClick={this.handleDeleteClick} accent>Delete</Button>
                    <Button type='button' onClick={this.closeDeleteConfirmDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );

        const renderEditButton = (scriptId, rowData, index) => {
            //return <IconButton name="edit" onClick={this.handleEditUserClick.bind(this, scriptId)}/>;
            const menuId = "more-user-action-menu" + index;
            return (
                <div>
                    <div style={{position: 'relative', color: '#999999'}}>
                        <IconButton name="edit" onClick={this.handleEditScriptClick.bind(this, scriptId)}/>
                        <IconButton name="more_vert" id={menuId} />
                        <Menu target={menuId} align="right">
                            <MenuItem onClick={this.openDeleteConfirmDialog.bind(this, scriptId)}>Delete</MenuItem>
                        </Menu>
                    </div>
                </div>
            )
        };

        const { scripts } = this.props.datastore;
        // console.log("Rendering script list");
        // console.log(JSON.stringify(scripts, null, 2));

        const renderTable = (
                <div>
                    <DataTable style={{width: '780px'}} shadow={0} rows={(scripts) ? scripts.toArray() : []}>
                        <TableHeader name="title">Title</TableHeader>
                        <TableHeader name="description">Description</TableHeader>
                        <TableHeader name="scriptId" style={{width: '64px'}} cellFormatter={renderEditButton} />
                    </DataTable>
                </div>
        );

        const renderEmptyTable = (
            <Card shadow={0} style={{width: '320px'}}>
                <CardTitle>There are no scripts</CardTitle>
                <CardText>To create your first script click on the orange icon at the bottom right of the window.<br/><br/><br/></CardText>
                {/*<CardActions border>*/}
                    {/*<Button onClick={this.handleAddScriptClick} colored>ADD SCRIPT</Button>*/}
                {/*</CardActions>*/}
            </Card>
        );

        return (
            <div>
                <FABButton style={styles.fab} colored ripple onClick={this.handleAddScriptClick}>
                    <Icon name="add" />
                </FABButton>
                <div style={styles.container}>
                    {(scripts) ? renderTable : renderEmptyTable}
                </div>
                {confirmDeleteDialog}
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

export default connect(mapStateToProps)(ScriptsList)