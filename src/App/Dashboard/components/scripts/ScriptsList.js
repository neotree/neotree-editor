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
    FABButton,
    Icon,
    IconButton,
    Menu,
    MenuItem,
    TableHeader
} from 'react-mdl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
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
            <Dialog
              open={this.state.openDeleteConfirmDialog}
              onClose={() => {}}
              fullWidth
              maxWidth="sm"
            >
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
