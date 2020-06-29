import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Card,
    CardText,
    DataTable,
    Radio,
    RadioGroup,
    TableHeader,
    Textfield
} from 'react-mdl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { MdDelete, MdCreate, MdAdd } from 'react-icons/md';
import Toolbar from 'Toolbar';
import { SymptomType } from 'App/constants';

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
  state = { ...RESET_STATE };

  componentWillReceiveProps(props) {
      const { items } = props;
      const state = {
          items: (items || [])
      };
      this.setState(state);
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
              <div
                className="ui__flex ui__alignItems_center"
                style={{ color: '#999999' }}
              >
                <div
                  className="ui__cursor_pointer"
                  onClick={this.openEditItemDialog(index)}
                >
                  <MdCreate style={{ fontSize: '24px' }} />
                </div>&nbsp;
                <div
                  className="ui__cursor_pointer"
                  onClick={this.openConfirmDeleteItemDialog(index)}
                >
                  <MdDelete style={{ fontSize: '24px' }} />
                </div>
              </div>
            );
        };

        return (
            <div>
                <Card shadow={0} style={styles.container}>
                    <Toolbar title="Signs/Risks">
                      <div
                        className="ui__cursor_pointer"
                        style={{ fontSize: '24px' }}
                        onClick={this.openNewItemDialog}
                      ><MdAdd /></div>
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


SymptomList.propTypes = {
  items: PropTypes.array,
  onUpdateSymptoms: PropTypes.func.isRequired
};
