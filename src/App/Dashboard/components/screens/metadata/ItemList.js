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

import {
    Button,
    Card,
    CardText,
    // DataTable,
    Icon,
    IconButton,
    Switch,
    // TableHeader,
    Textfield
} from 'react-mdl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Toolbar from 'components/Toolbar';

import {
    Table,
    TableHeader
} from '../../datatable';

import { createScreen, deleteScreen, subscribeScreenChanges, unsubscribeScreenChanges } from 'actions/datastore';
import { arrayMove } from 'AppUtils';

import { DataType, ScreenType } from '../../../constants';

const RESET_STATE = {
    enableItemSwapAction: false,
    enableItemMoveUpAction: false,
    enableItemMoveDownAction: false,
    openNewItemDialog: false,
    openEditItemDialog: false,
    openConfirmDeleteItemDialog: false,
    actionItemIndex: null,
    itemDataType: null,
    itemChecked: false,
    itemId: null,
    itemExclusive: false,
    itemKey: null,
    itemConfidential: false,
    itemLabel: null,
    itemSummary: null
};

export default class ItemList extends Component {

    static contextTypes = {
        screenType: React.PropTypes.string
    };

    static propTypes = {
        metadata: React.PropTypes.object,
        onItemsChanged:  React.PropTypes.func.isRequired,
        onUpdateMetadata: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            ...RESET_STATE
        };
    }

    collectItemData = () => {
        const { screenType } = this.context;
        const { itemChecked, itemId, itemExclusive, itemKey, itemConfidential, itemLabel, itemSummary } = this.state;

        var itemDataType;
        switch (screenType) {
            case ScreenType.MANAGEMENT:
            case ScreenType.PROGRESS:
            case ScreenType.LIST:
                itemDataType = DataType.VOID;
                break;
            case ScreenType.CHECKLIST:
                itemDataType = DataType.BOOLEAN;
                break;
            case ScreenType.MULTI_SELECT:
            case ScreenType.SINGLE_SELECT:
                itemDataType = DataType.ID;
                break;
        }
        return {
            dataType: itemDataType,
            checked: (itemChecked) ? itemChecked : null,
            id: (itemId) ? itemId : null,
            exclusive: (itemExclusive) ? itemExclusive : null,
            key: (itemKey) ? itemKey : null,
            confidential: (itemConfidential) ? itemConfidential : false,
            label : (itemLabel) ? itemLabel : null,
            summary: (itemSummary) ? itemSummary : null
        };
    };

    componentWillMount() {
        const { items } = (this.props.metadata || {});
        const state = {
            items: (items || [])
        };
        this.setState(state);
        this.props.onUpdateMetadata(state);
    }

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    handleSwitchChange = (name) => {
        return () => {
            const currentValue = (this.state[name]) ? this.state[name] : false;
            this.setState({...this.state, [name]: !currentValue});
        }
    };

    handleItemSelection = (keys) => {
        if (keys.length == 1) {
            const { items } = (this.props.metadata || {});
            const index = keys[0];
            this.setState({
                ...this.state,
                enableItemSwapAction: false,
                enableItemMoveUpAction: (items.length > 0 && index > 1),
                enableItemMoveDownAction: (items.length > 0 && index < items.length),
                selectedIndex: index,
                swapIndex0: keys[0],
                swapIndex1: keys[1]
            });
        } else if (keys.length == 2) {
            this.setState({
                ...this.state,
                enableItemSwapAction: true,
                enableItemMoveUpAction: false,
                enableItemMoveDownAction: false,
                selectedIndex: null,
                swapIndex0: keys[0],
                swapIndex1: keys[1]
            });
        } else {
            this.setState({
                ...this.state,
                enableItemSwapAction: false,
                enableItemMoveUpAction: false,
                enableItemMoveDownAction: false,
                selectedIndex: null,
                swapIndex0: null,
                swapIndex1: null
            });
        }
    };

    handleItemActionClick = (action) => {
        // console.log('handleItemActionClick() - ' + action);
        const { actionItemIndex, items, selectedIndex, swapIndex0, swapIndex1 } = this.state;

        const item = this.collectItemData();

        var updatedItems = (items || []);
        var closeFn = () => {};
        var itemIndex, tmp;
        switch (action) {
            case 'add':
                updatedItems.push(item);
                closeFn = this.closeNewItemDialog;
                break;
            case 'delete':
                updatedItems.splice(actionItemIndex, 1);
                closeFn = this.closeConfirmDeleteItemDialog;
                break;
            case 'update':
                updatedItems[actionItemIndex] = item;
                closeFn = this.closeEditItemDialog;
                break;
            case 'swap':
                tmp = updatedItems[swapIndex0 - 1];
                updatedItems[swapIndex0 - 1] = updatedItems[swapIndex1 - 1];
                updatedItems[swapIndex1 - 1] = tmp;
                break;
            case 'move_up':
                itemIndex = selectedIndex - 1; // Normalize to array index
                tmp = updatedItems[itemIndex - 1];
                updatedItems[itemIndex - 1] = updatedItems[itemIndex];
                updatedItems[itemIndex] = tmp;
                break;
            case 'move_down':
                itemIndex = selectedIndex - 1; // Normalize to array index
                tmp = updatedItems[itemIndex + 1];
                updatedItems[itemIndex + 1] = updatedItems[itemIndex];
                updatedItems[itemIndex] = tmp;
                break;
        }
        this.fixItemsPositions(updatedItems);

        this.setState({
            ...this.state,
            actionItemIndex: null,
            items: updatedItems
        });
        this.props.onUpdateMetadata({ items: updatedItems });
        this.props.onItemsChanged();

        closeFn();
    };

    swapItems = (oldIndex, newIndex) => {
        console.log("Swapping items [oldIndex=" + oldIndex + ", newIndex=" + newIndex + "]");

        const { items } = this.state;

        var updatedItems = (items || []);
        updatedItems = arrayMove(updatedItems, oldIndex, newIndex);
        // var tmp = updatedItems[oldIndex];
        // updatedItems[oldIndex] = updatedItems[newIndex];
        // updatedItems[newIndex] = tmp;

        this.fixItemsPositions(updatedItems);

        this.setState({
            ...this.state,
            items: updatedItems
        });
    };

    openNewItemDialog = () => {
        console.log('openNewItemDialog()');
        this.setState({
            ...this.state,
            openNewItemDialog: true
        });
    };

    closeNewItemDialog = () => {
        console.log('closeNewItemDialog()');
        this.setState({
            ...this.state,
            ...RESET_STATE
        });
    };

    openEditItemDialog = (index) => {
        return () => {
            const { items } = this.state;
            const item = items[index];

            this.setState({
                ...this.state,
                openEditItemDialog: true,
                actionItemIndex: index,
                itemChecked: item.checked,
                itemId: item.id,
                itemLabel: item.label,
                itemSummary: item.summary,
                itemKey: item.key,
                itemConfidential: item.confidential,
                itemExclusive: item.exclusive
            });
        }
    };

    closeEditItemDialog = () => {
        this.setState({
            ...this.state,
            ...RESET_STATE
        });
    };

    openConfirmDeleteItemDialog = (index) => {
        return () => {
            this.setState({
                ...this.state,
                openConfirmDeleteItemDialog: true,
                actionItemIndex: index
            });
        }
    };

    closeConfirmDeleteItemDialog = () => {
        this.setState({
            ...this.state,
            openConfirmDeleteItemDialog: false,
            actionItemIndex: null
        });
    };

    fixItemsPositions = (items) => {
        // Add/Set item position as key to each item
        if (items) {
            items.map((value, index) => {
                value.position = index + 1;
            });
        }
    };

    render() {
        const styles = {
            dialog: {
                width: '460px'
            },
            container: {
                marginTop: '24px',
                width: '780px'
            },
            table: {
                width: '100%'
            },
            emptyMessageContainer : {
                display: 'flex',
                boxSizing: 'border-box',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#757575',
                fontSize: '16px'
            },
            flexRow : {
                display: 'flex',
                flexDirection: 'row'
            }
        };

        const {
            enableItemSwapAction,
            enableItemMoveUpAction,
            enableItemMoveDownAction,
            openNewItemDialog,
            openEditItemDialog,
            openConfirmDeleteItemDialog,
            itemChecked,
            itemId,
            itemExclusive,
            itemKey,
            itemConfidential,
            itemLabel,
            itemSummary,
            items
        } = this.state;

        // console.log(JSON.stringify(this.state, null, 2));

        const { screenType } = this.context;

        const itemDialogContent = (
            <div>
                {(screenType == ScreenType.MULTI_SELECT || screenType == ScreenType.SINGLE_SELECT) ?
                    <div style={styles.flexRow}>
                        <Textfield
                            style={{flex: 1, marginRight: "12px"}}
                            floatingLabel
                            label="ID"
                            required={true}
                            pattern="[a-zA-Z0-9]+"
                            onChange={this.handleInputChange.bind(this, 'itemId')}
                            value={itemId || ""} />
                        <Textfield
                            style={{flex: 5, marginLeft: "12px"}}
                            floatingLabel
                            label="Label"
                            required={true}
                            onChange={this.handleInputChange.bind(this, 'itemLabel')}
                            value={itemLabel || ""} />
                    </div>
                    :
                    <Textfield
                        style={{width : "100%"}}
                        floatingLabel
                        label="Label"
                        required={true}
                        onChange={this.handleInputChange.bind(this, 'itemLabel')}
                        value={itemLabel || ""} />
                }

                {(screenType !== ScreenType.MULTI_SELECT && screenType != ScreenType.SINGLE_SELECT  && screenType != ScreenType.PROGRESS) ?
                    <Textfield
                        style={{width : "100%"}}
                        floatingLabel
                        label="Summary"
                        onChange={this.handleInputChange.bind(this, 'itemSummary')}
                        value={itemSummary || ""} />
                    : null
                }

                {(screenType != ScreenType.CHECKLIST) ? null :
                    <div>
                        <Textfield
                            style={{width: "100%"}}
                            floatingLabel
                            label="Key"
                            required={true}
                            pattern="[a-zA-Z0-9]+"
                            onChange={this.handleInputChange.bind(this, 'itemKey')}
                            value={itemKey || ""} />

                        {/*itemConfidential*/}
                        <div style={{ width: '100%', display: 'flex', alignContent: 'flex-end', marginBottom: '24px'}}>
                            <Switch id="itemConfidential"
                                    checked={itemConfidential || false}
                                    onChange={this.handleSwitchChange('itemConfidential')}>
                                Confidential
                            </Switch>
                        </div>
                    </div>
                }

                {(screenType == ScreenType.CHECKLIST || screenType == ScreenType.MULTI_SELECT) ?
                    <Switch id="itemExclusiveSwitch"
                            checked={itemExclusive || false}
                            onChange={this.handleSwitchChange('itemExclusive')}>
                        Disable other items if selected
                    </Switch>
                    : null
                }

                {(screenType == ScreenType.PROGRESS) ?
                    <Switch id="itemCheckedSwitch"
                            checked={itemChecked || false}
                            onChange={this.handleSwitchChange('itemChecked')}>
                        Mark as checked
                    </Switch>
                    : null
                }

            </div>
        );

        const openItemDialog = (openNewItemDialog || openEditItemDialog);
        const itemDialog = (
            <Dialog
              open={openItemDialog}
              onClose={() => {}}
              fullWidth
              maxWidth="sm"
            >
                <DialogContent>
                    {itemDialogContent}
                </DialogContent>
                <DialogActions>
                    { (!openNewItemDialog) ? null :
                        <div>
                            <Button type='button' onClick={this.closeNewItemDialog}>Cancel</Button>
                            <Button type='button' onClick={this.handleItemActionClick.bind(this, 'add')} accent>Create</Button>
                        </div>
                    }
                    { (!openEditItemDialog) ? null :
                        <div>
                            <Button type='button' onClick={this.closeEditItemDialog}>Cancel</Button>
                            <Button type='button' onClick={this.handleItemActionClick.bind(this, 'update')} accent>Update</Button>
                        </div>
                    }
                </DialogActions>
            </Dialog>
        );

        const confirmDeleteItemDialog = (
            <Dialog
              open={openConfirmDeleteItemDialog}
              onClose={() => {}}
              fullWidth
              maxWidth="sm"
            >
                <DialogContent>
                    <p>Are you sure you want to delete this item?</p>
                </DialogContent>
                <DialogActions>
                    <Button type='button' onClick={this.handleItemActionClick.bind(this, 'delete')} accent>Delete</Button>
                    <Button type='button' onClick={this.closeConfirmDeleteItemDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );

        const renderItemActions = (screenId, rowData, index) => {
            return (
                <div style={{display: 'flex', flexDirection:'row', alignContent: 'end', color: "#999999"}}>
                    <IconButton name="edit" onClick={this.openEditItemDialog(index)}/>
                    <IconButton name="delete" onClick={this.openConfirmDeleteItemDialog(index)}/>
                </div>
            )
        };

        const renderExclusiveIcon = (screenId, rowData, index) => {
            return (!rowData.exclusive) ? null :
                <div style={{display: 'flex', flexDirection:'row', justifyContent: "center", color: "#2196f3"}}>
                    <Icon name="done"/>
                </div>;
        };

        const renderCheckedIcon = (screenId, rowData, index) => {
            return (!rowData.checked) ? null :
                <div style={{display: 'flex', flexDirection:'row', justifyContent: "center", color: "#2196f3"}}>
                    <Icon name="done"/>
                </div>;
        };

        var itemTable = null;
        switch (screenType) {
            case ScreenType.CHECKLIST:
                itemTable = (
                    <Table ref="dataTable"
                           style={styles.table}
                           rows={items}
                           rowKeyColumn="position"
                           onSort={this.swapItems}>
                        <TableHeader name="key">Key</TableHeader>
                        <TableHeader name="label" style={{width: '100%'}}>Label</TableHeader>
                        <TableHeader name="exclusive" cellFormatter={renderExclusiveIcon}>Exclusive</TableHeader>
                        <TableHeader name="screenId" style={{width: '48px'}} cellFormatter={renderItemActions} />
                    </Table>
                );
                break;
            case ScreenType.MULTI_SELECT:
            case ScreenType.SINGLE_SELECT:
                itemTable = (
                    <Table ref="dataTable"
                           style={styles.table}
                           rows={items}
                           rowKeyColumn="position"
                           onSort={this.swapItems}>
                        <TableHeader name="id">ID</TableHeader>
                        <TableHeader name="label" style={{width: '100%'}}>Label</TableHeader>
                        {(screenType == ScreenType.MULTI_SELECT)
                            ? <TableHeader name="exclusive" cellFormatter={renderExclusiveIcon}>Exclusive</TableHeader>
                            : null}
                        <TableHeader name="screenId" style={{width: '48px'}} cellFormatter={renderItemActions} />
                    </Table>
                );
                break;
            case ScreenType.PROGRESS:
                itemTable = (
                    <Table ref="dataTable"
                           style={styles.table}
                           rows={items}
                           rowKeyColumn="position"
                           onSort={this.swapItems}>
                        <TableHeader name="label" style={{width: '100%'}}>Label</TableHeader>
                        <TableHeader name="checked" cellFormatter={renderCheckedIcon}>Checked</TableHeader>
                        <TableHeader name="screenId" style={{width: '48px'}} cellFormatter={renderItemActions} />
                    </Table>
                );
                break;
            case ScreenType.LIST:
                itemTable = (
                    <Table ref="dataTable"
                           style={styles.table}
                           rows={items}
                           rowKeyColumn="position"
                           onSort={this.swapItems}>
                        <TableHeader name="label">Label</TableHeader>
                        <TableHeader name="summary" style={{width: '100%'}}>Summary</TableHeader>
                        <TableHeader name="$index" style={{width: '48px'}} cellFormatter={renderItemActions} />
                    </Table>
                );
                break;
            default:
                console.log('unknown screen type for displaying item table');
        }

        //console.log(JSON.stringify(items, null, 2));

        return (
            <div>
                <Card shadow={0} style={styles.container}>
                    <Toolbar title="Items">
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <IconButton name="add" onClick={this.openNewItemDialog} />
                            {(enableItemSwapAction) ? <IconButton name="swap_vert" onClick={this.handleItemActionClick.bind(this, 'swap')} /> : null}
                            {(enableItemMoveUpAction) ? <IconButton name="arrow_upward" onClick={this.handleItemActionClick.bind(this, 'move_up')} /> : null}
                            {(enableItemMoveDownAction) ? <IconButton name="arrow_downward" onClick={this.handleItemActionClick.bind(this, 'move_down')} /> : null}
                        </div>
                    </Toolbar>

                    {(items && items.length > 0) ? itemTable
                        :
                        <CardText>
                            <div style={styles.emptyMessageContainer}>
                                <div>The list of items is empty</div>
                            </div>
                        </CardText>
                    }
                </Card>
                {itemDialog}
                {confirmDeleteItemDialog}
            </div>
        );
    }

}
