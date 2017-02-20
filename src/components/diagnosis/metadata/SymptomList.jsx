/*
 * The MIT License (MIT)
 * Copyright (c) 2017 Ubiqueworks Ltd and contributors
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
    DataTable,
    Dialog,
    DialogActions,
    DialogContent,
    Icon,
    IconButton,
    Radio,
    RadioGroup,
    TableHeader,
    Textfield
} from 'react-mdl';

import Toolbar from 'components/Toolbar';
import { SymptomType } from '../../../constants';


import { arrayMove } from '../../../utils';

const RESET_STATE = {
    openNewItemDialog: false,
    openEditItemDialog: false,
    openConfirmDeleteItemDialog: false,
    actionItemIndex: null,
    itemType: null,
    itemName: null,
    itemExpression: null
};

export default class SymptomList extends Component {

    static propTypes = {
        items: React.PropTypes.array,
        onUpdateSymptoms: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            ...RESET_STATE
        };
    }

    collectItemData = () => {
        const { itemType, itemName, itemWeight, itemExpression } = this.state;
        return {
            type: (itemType) ? itemType : null,
            name: (itemName) ? itemName : null,
            weight: (itemWeight) ? itemWeight : null,
            expression: (itemExpression) ? itemExpression : null
        };
    };

    componentWillReceiveProps(props) {
        const { items } = props;
        const state = {
            items: (items || [])
        };
        this.setState(state);
    }

    handleInputChange = (name, event) => {
        this.setState({...this.state, [name]: event.target.value});
    };

    handleItemActionClick = (action) => {
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
        }

        this.setState({
            ...this.state,
            actionItemIndex: null,
            items: updatedItems
        });
        this.props.onUpdateSymptoms({ symptoms: updatedItems });

        closeFn();
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
                itemType: item.type,
                itemName: item.name,
                itemWeight: item.weight,
                itemExpression: item.expression
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
            openNewItemDialog,
            openEditItemDialog,
            openConfirmDeleteItemDialog,
            itemType,
            itemName,
            itemWeight,
            itemExpression,
            items
        } = this.state;

        const itemDialogContent = (
            <div>
                <p>Type:</p>

                <RadioGroup
                    container="div"
                    childContainer="div"
                    name="itemType"
                    value={itemType || ""}
                    onChange={this.handleInputChange.bind(this, 'itemType')}
                >
                    <Radio value={SymptomType.RISK} ripple>Risk factor</Radio>
                    <Radio value={SymptomType.SIGN} ripple>Sign/Symptom</Radio>
                </RadioGroup>

                <Textfield
                    style={{width: '100%'}}
                    floatingLabel
                    label="Name"
                    required={true}
                    onChange={this.handleInputChange.bind(this, 'itemName')}
                    value={itemName || ""}
                />

                <Textfield
                    style={{width: '100%'}}
                    floatingLabel
                    label="Weight"
                    required={false}
                    pattern="-?[0-9]*(\.[0-9]+)?"
                    onChange={this.handleInputChange.bind(this, 'itemWeight')}
                    value={itemWeight || ""}
                />
                <div style={{fontSize: '12px', fontStyle: 'italic', marginBottom: '12px'}}>Must be in the range: 0.0 - 1.0 (<span style={{fontWeight:'bold'}}>default 1.0</span>)</div>

                <Textfield
                    style={{width : "100%"}}
                    floatingLabel
                    label="Sign/Risk Expression"
                    required={true}
                    value={itemExpression || ""}
                    onChange={this.handleInputChange.bind(this, 'itemExpression')}
                />
                <div style={{fontSize: '12px', fontStyle: 'italic', marginBottom: '12px'}}>Example: <span style={{fontWeight:'bold'}}>($key = true and $key2 = false) or $key3 = 'HD'</span></div>

            </div>
        );

        const openItemDialog = (openNewItemDialog || openEditItemDialog);
        const itemDialog = (
            <Dialog open={openItemDialog} style={styles.dialog}>
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
            <Dialog open={openConfirmDeleteItemDialog}>
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

        return (
            <div>
                <Card shadow={0} style={styles.container}>
                    <Toolbar title="Signs/Risks">
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <IconButton name="add" onClick={this.openNewItemDialog} />
                        </div>
                    </Toolbar>

                    {(items && items.length > 0) ?
                        <DataTable style={styles.table} shadow={0} rows={items || []}>
                            <TableHeader name="type">Type</TableHeader>
                            <TableHeader name="name">Name</TableHeader>
                            <TableHeader name="diagnosisId" style={{width: '48px'}} cellFormatter={renderItemActions} />
                        </DataTable>
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
