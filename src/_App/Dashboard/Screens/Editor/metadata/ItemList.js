import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardText,
  // DataTable,
  Switch,
  // TableHeader,
  Textfield
} from 'react-mdl';
import {
  MdCreate,
  MdDelete,
  MdDone,
  MdAdd,
  MdSwapVert,
  MdArrowUpward,
  MdArrowDownward
} from 'react-icons/md';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Toolbar from 'Toolbar';
import { arrayMove } from 'AppUtils';
import { DataType, ScreenType } from 'App/constants';
import { Table, TableHeader } from '../../datatable';

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
  state = { ...RESET_STATE };

  componentWillMount() {
    const { items } = (this.props.metadata || {});
    const state = { items: (items || []) };
    this.setState(state);
    this.props.onUpdateMetadata(state);
  }

  collectItemData = () => {
    const { screenType } = this.props;
    const { itemChecked, itemId, itemExclusive, itemKey, itemConfidential, itemLabel, itemSummary } = this.state;

    let itemDataType;
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
      default:
        // do nothing
    }

    return {
      dataType: itemDataType,
      checked: (itemChecked) ? itemChecked : null,
      id: (itemId) ? itemId : null,
      exclusive: (itemExclusive) ? itemExclusive : null,
      key: (itemKey) ? itemKey : null,
      confidential: (itemConfidential) ? itemConfidential : false,
      label: (itemLabel) ? itemLabel : null,
      summary: (itemSummary) ? itemSummary : null
    };
  };

  handleInputChange = (name, event) => {
    this.setState({ ...this.state, [name]: event.target.value });
  };

  handleSwitchChange = (name) => {
    return () => {
      const currentValue = (this.state[name]) ? this.state[name] : false;
      this.setState({ ...this.state, [name]: !currentValue });
    };
  };

  handleItemSelection = (keys) => {
    if (keys.length === 1) {
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
    } else if (keys.length === 2) {
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

    const updatedItems = (items || []);
    let closeFn = () => {};
    let itemIndex;
    let tmp;

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
      default:
      // do nothing
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
    const { items } = this.state;

    let updatedItems = (items || []);
    updatedItems = arrayMove(updatedItems, oldIndex, newIndex);
    // let tmp = updatedItems[oldIndex];
    // updatedItems[oldIndex] = updatedItems[newIndex];
    // updatedItems[newIndex] = tmp;

    this.fixItemsPositions(updatedItems);

    this.setState({
      ...this.state,
      items: updatedItems
    });
  };

  openNewItemDialog = () => this.setState({ ...this.state, openNewItemDialog: true });

  closeNewItemDialog = () => this.setState({ ...this.state, ...RESET_STATE });

  openEditItemDialog = (index) => () => {
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
  };

  closeEditItemDialog = () => this.setState({
    ...this.state,
    ...RESET_STATE
  });

  openConfirmDeleteItemDialog = (index) => () => {
    this.setState({
      ...this.state,
      openConfirmDeleteItemDialog: true,
      actionItemIndex: index
    });
  };

  closeConfirmDeleteItemDialog = () => this.setState({
    ...this.state,
    openConfirmDeleteItemDialog: false,
    actionItemIndex: null
  });

  fixItemsPositions = items => items && items.forEach((value, index) => (value.position = index + 1));

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
      emptyMessageContainer: {
        display: 'flex',
        boxSizing: 'border-box',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#757575',
        fontSize: '16px'
      },
      flexRow: {
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

    const { screenType } = this.props;

    const itemDialogContent = (
      <div>
        {(screenType === ScreenType.MULTI_SELECT || screenType === ScreenType.SINGLE_SELECT) ?
          <div style={styles.flexRow}>
            <Textfield
              style={{ flex: 1, marginRight: '12px' }}
              floatingLabel
              label="ID"
              required
              pattern="[a-zA-Z0-9]+"
              onChange={this.handleInputChange.bind(this, 'itemId')}
              value={itemId || ''}
            />
            <Textfield
              style={{ flex: 5, marginLeft: '12px' }}
              floatingLabel
              label="Label"
              required
              onChange={this.handleInputChange.bind(this, 'itemLabel')}
              value={itemLabel || ''}
            />
          </div>
          :
          <Textfield
            style={{ width: '100%' }}
            floatingLabel
            label="Label"
            required
            onChange={this.handleInputChange.bind(this, 'itemLabel')}
            value={itemLabel || ''}
          />}

        {((screenType !== ScreenType.MULTI_SELECT) &&
          (screenType !== ScreenType.SINGLE_SELECT) &&
          (screenType !== ScreenType.PROGRESS)) ?
            <Textfield
              style={{ width: '100%' }}
              floatingLabel
              label="Summary"
              onChange={this.handleInputChange.bind(this, 'itemSummary')}
              value={itemSummary || ''}
            />
            : null}

        {(screenType !== ScreenType.CHECKLIST) ? null :
          <div>
            <Textfield
              style={{ width: '100%' }}
              floatingLabel
              label="Key"
              required
              pattern="[a-zA-Z0-9]+"
              onChange={this.handleInputChange.bind(this, 'itemKey')}
              value={itemKey || ''}
            />

            {/*itemConfidential*/}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignContent: 'flex-end',
                marginBottom: '24px'
              }}
            >
              <Switch
                id="itemConfidential"
                checked={itemConfidential || false}
                onChange={this.handleSwitchChange('itemConfidential')}
              >
                Confidential
              </Switch>
            </div>
          </div>}

        {!((screenType === ScreenType.CHECKLIST) || (screenType === ScreenType.MULTI_SELECT)) ? null :
            <Switch
              id='itemExclusiveSwitch'
              checked={itemExclusive || false}
              onChange={this.handleSwitchChange('itemExclusive')}
            >
              Disable other items if selected
            </Switch>}

        {!(screenType === ScreenType.PROGRESS) ? null :
          <Switch
            id="itemCheckedSwitch"
            checked={itemChecked || false}
            onChange={this.handleSwitchChange('itemChecked')}
          >
            Mark as checked
          </Switch>}

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
        <DialogContent>{itemDialogContent}</DialogContent>
        <DialogActions>
          {!openNewItemDialog ? null :
            <div>
              <Button type='button' onClick={this.closeNewItemDialog}>Cancel</Button>
              <Button type='button' onClick={this.handleItemActionClick.bind(this, 'add')} accent>Create</Button>
            </div>}

          {!openEditItemDialog ? null :
            <div>
              <Button type='button' onClick={this.closeEditItemDialog}>Cancel</Button>
              <Button type='button' onClick={this.handleItemActionClick.bind(this, 'update')} accent>Update</Button>
            </div>}
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
        <DialogContent><p>Are you sure you want to delete this item?</p></DialogContent>
        <DialogActions>
          <Button type='button' onClick={this.handleItemActionClick.bind(this, 'delete')} accent>Delete</Button>
          <Button type='button' onClick={this.closeConfirmDeleteItemDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );

    const renderItemActions = (screenId, rowData, index) => (
      <div className="ui__flex ui__alignItems_center" style={{ color: '#999999' }}>
        <MdCreate className="ui__cursor_pointer ui__defaultIconSize" onClick={this.openEditItemDialog(index)} />&nbsp;
        <MdDelete className="ui__cursor_pointer ui__defaultIconSize" onClick={this.openConfirmDeleteItemDialog(index)} />
      </div>
    );

    const renderExclusiveIcon = (screenId, rowData) => {
      return (!rowData.exclusive) ? null :
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            color: '#2196f3'
          }}
        >
          <MdDone style={{ fontSize: '24px' }} />
        </div>;
    };

    const renderCheckedIcon = (screenId, rowData) => {
      return !rowData.checked ? null : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            color: '#2196f3'
          }}
        >
            <MdDone style={{ fontSize: '24px' }} />
        </div>
      );
    };

    let itemTable = null;
    switch (screenType) {
      case ScreenType.CHECKLIST:
          itemTable = (
              <Table
                ref="dataTable"
                style={styles.table}
                rows={items}
                rowKeyColumn="position"
                onSort={this.swapItems}
              >
                  <TableHeader name="key">Key</TableHeader>
                  <TableHeader name="label" style={{ width: '100%' }}>Label</TableHeader>
                  <TableHeader name="exclusive" cellFormatter={renderExclusiveIcon}>Exclusive</TableHeader>
                  <TableHeader name="screenId" style={{ width: '48px' }} cellFormatter={renderItemActions} />
              </Table>
          );
          break;
      case ScreenType.MULTI_SELECT:
      case ScreenType.SINGLE_SELECT:
          itemTable = (
              <Table
                ref="dataTable"
                style={styles.table}
                rows={items}
                rowKeyColumn="position"
                onSort={this.swapItems}
              >
                  <TableHeader name="id">ID</TableHeader>
                  <TableHeader name="label" style={{ width: '100%' }}>Label</TableHeader>
                  {!(screenType === ScreenType.MULTI_SELECT) ? null :
                      <TableHeader name="exclusive" cellFormatter={renderExclusiveIcon}>Exclusive</TableHeader>}
                  <TableHeader name="screenId" style={{ width: '48px' }} cellFormatter={renderItemActions} />
              </Table>
          );
          break;
      case ScreenType.PROGRESS:
          itemTable = (
              <Table
                ref="dataTable"
                style={styles.table}
                rows={items}
                rowKeyColumn="position"
                onSort={this.swapItems}
              >
                  <TableHeader name="label" style={{ width: '100%' }}>Label</TableHeader>
                  <TableHeader name="checked" cellFormatter={renderCheckedIcon}>Checked</TableHeader>
                  <TableHeader name="screenId" style={{ width: '48px' }} cellFormatter={renderItemActions} />
              </Table>
          );
          break;
      case ScreenType.LIST:
          itemTable = (
              <Table
                ref="dataTable"
                style={styles.table}
                rows={items}
                rowKeyColumn="position"
                onSort={this.swapItems}
              >
                  <TableHeader name="label">Label</TableHeader>
                  <TableHeader name="summary" style={{ width: '100%' }}>Summary</TableHeader>
                  <TableHeader name="$index" style={{ width: '48px' }} cellFormatter={renderItemActions} />
              </Table>
          );
          break;
      default:
          // do nothing
    }

    //console.log(JSON.stringify(items, null, 2));

    return (
      <div>
          <Card shadow={0} style={styles.container}>
              <Toolbar title="Items">
                  <div className="ui__flex ui__alignItems_center">
                    <div className="ui__cursor_pointer" onClick={this.openNewItemDialog}>
                      <MdAdd style={{ fontSize: '24px' }} />
                    </div>
                    {(enableItemSwapAction) ?
                      <div className="ui__cursor_pointer" onClick={this.handleItemActionClick.bind(this, 'swap')}>
                        <MdSwapVert style={{ fontSize: '24px' }} />
                      </div> : null}
                    {(enableItemMoveUpAction) ?
                      <div className="ui__cursor_pointer" onClick={this.handleItemActionClick.bind(this, 'move_up')}>
                        <MdArrowUpward style={{ fontSize: '24px' }} />
                      </div> : null}
                    {(enableItemMoveDownAction) ?
                      <div className="ui__cursor_pointer" onClick={this.handleItemActionClick.bind(this, 'move_down')}>
                        <MdArrowDownward style={{ fontSize: '24px' }} />
                      </div> : null}
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

ItemList.propTypes = {
    metadata: PropTypes.object,
    onItemsChanged: PropTypes.func.isRequired,
    onUpdateMetadata: PropTypes.func.isRequired
};
