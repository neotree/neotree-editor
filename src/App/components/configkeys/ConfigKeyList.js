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
    DialogContent,
    FABButton,
    Icon,
    IconButton,
    TableHeader,
    Textfield
} from 'react-mdl';

import { createConfigKey, deleteConfigKey, subscribeConfigKeyChanges, unsubscribeConfigKeyChanges } from 'actions/datastore';

class ConfigKeyList extends Component {

    static contextTypes = {
        store: React.PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            openDeleteConfirmDialog: false,
            openCreateConfigKeyDialog: false,
            configKeyIdForAction: null,
            configKeys: null
        };
    }

    componentWillMount() {
        subscribeConfigKeyChanges((configKeys) => {
            console.log('update config keys list');
            this.setState({
                ...this.state,
                configKeys: configKeys
            })
        });
    }

    componentWillUnmount() {
        unsubscribeConfigKeyChanges();
    }

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    handleCreateClick = () => {
        const { addConfigKey, addConfigLabel, addConfigSummary } = this.state;
        createConfigKey(addConfigKey, addConfigLabel, addConfigSummary)
            .then(() => {
                console.log('create config key success');
            })
            .catch(error => {
                console.error(error)
            });
        this.closeCreateConfigKeyDialog();
    };

    handleDeleteClick = () => {
        const { configKeyIdForAction } = this.state;
        deleteConfigKey(configKeyIdForAction)
            .catch(error => {
                console.error(error)
            });
        this.closeDeleteConfirmDialog();
    };

    openCreateConfigKeyDialog = () => {
        this.setState({
            ...this.state,
            openCreateConfigKeyDialog: true,
        });
    };

    closeCreateConfigKeyDialog = () => {
        this.setState({
            ...this.state,
            openCreateConfigKeyDialog: false,
            addConfigKey: null,
            addConfigLabel: null,
            addConfigSummary: null
        });
    };

    openDeleteConfirmDialog = (configKeyId) => {
        console.log("delete id: " + configKeyId);
        this.setState({
            ...this.state,
            openDeleteConfirmDialog: true,
            configKeyIdForAction: configKeyId
        });
    };

    closeDeleteConfirmDialog = () => {
        this.setState({
            ...this.state,
            openDeleteConfirmDialog: false,
            configKeyIdForAction: null
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

        const { addConfigKey, addConfigLabel, addConfigSummary } = this.state;

        const createConfigKeyDialog = (
            <Dialog open={this.state.openCreateConfigKeyDialog} style={{width: '540px'}}>
                <DialogContent>
                    <Textfield
                        style={{width : "100%"}}
                        floatingLabel
                        label="Key"
                        onChange={this.handleInputChange.bind(this, 'addConfigKey')}
                        value={addConfigKey || ""}

                    />

                    <Textfield
                        style={{width : "100%"}}
                        floatingLabel
                        label="Label"
                        onChange={this.handleInputChange.bind(this, 'addConfigLabel')}
                        value={addConfigLabel || ""}

                    />

                    <Textfield
                        style={{width : "100%"}}
                        floatingLabel
                        label="Summary"
                        onChange={this.handleInputChange.bind(this, 'addConfigSummary')}
                        value={addConfigSummary || ""}

                    />
                </DialogContent>
                <DialogActions>
                    <Button type='button' onClick={this.handleCreateClick} accent>Create</Button>
                    <Button type='button' onClick={this.closeCreateConfigKeyDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );

        const confirmDeleteDialog = (
            <Dialog open={this.state.openDeleteConfirmDialog}>
                <DialogContent>
                    <p>Are you sure you want to delete this configuration key?</p>
                </DialogContent>
                <DialogActions>
                    <Button type='button' onClick={this.handleDeleteClick} accent>Delete</Button>
                    <Button type='button' onClick={this.closeDeleteConfirmDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );

        const renderItemActionButton = (id, rowData, index) => {
            return (
                <div>
                    <div style={{position: 'relative', color: '#999999'}}>
                        <IconButton name="delete" onClick={this.openDeleteConfirmDialog.bind(this, id)}/>
                    </div>
                </div>
            )
        };

        const { configKeys } = this.state;
        // console.log("Rendering script list");
        // console.log(JSON.stringify(scripts, null, 2));

        const renderTable = (
                <div>
                    <DataTable style={{width: '780px'}} shadow={0} rows={(configKeys) ? configKeys : []}>
                        <TableHeader name="configKey">Key</TableHeader>
                        <TableHeader name="label">Label</TableHeader>
                        <TableHeader name="summary">Summary</TableHeader>
                        <TableHeader name="configKeyId" style={{width: '32px'}} cellFormatter={renderItemActionButton} />
                    </DataTable>
                </div>
        );

        const renderEmptyTable = (
            <Card shadow={0} style={{width: '420px'}}>
                <CardTitle>There are no configuration keys</CardTitle>
                <CardText>To create your first configuration key click on the orange icon at the bottom right of the window.<br/><br/><br/></CardText>
                {/*<CardActions border>*/}
                    {/*<Button onClick={this.openCreateConfigKeyDialog} colored>ADD CONFIGURATION KEY</Button>*/}
                {/*</CardActions>*/}
            </Card>
        );

        return (
            <div>
                <FABButton style={styles.fab} colored ripple onClick={this.openCreateConfigKeyDialog}>
                    <Icon name="add" />
                </FABButton>
                <div style={styles.container}>
                    {(configKeys && configKeys.length > 0) ? renderTable : renderEmptyTable}
                </div>
                {createConfigKeyDialog}
                {confirmDeleteDialog}
            </div>
        );
    }
}

export default ConfigKeyList
