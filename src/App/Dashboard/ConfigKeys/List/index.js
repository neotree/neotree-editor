import React, { Component } from 'react';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import {
    Button,
    Card,
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

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDeleteConfirmDialog: false,
      openCreateConfigKeyDialog: false,
      configKeyIdForAction: '',
      configKeys: ''
    };
  }

  handleInputChange = (name, event) => this.setState({
    ...this.state,
    [name]: event.target.value
  });

  handleCreateClick = () => {
    const { actions } = this.props;
    const { addConfigKey, addConfigLabel, addConfigSummary } = this.state;
    this.setState({ creatingConfigKey: true });
    actions.post('create-config-key', {
      addConfigKey,
      addConfigLabel,
      addConfigSummary,
      onResponse: () => this.setState({ creatingConfigKey: false }),
      onFailure: createConfigKeyError => this.setState({ createConfigKeyError }),
      onSuccess: newKey => {
        actions.updateApiData(state =>
          ({ configKeys: [newKey, ...state.configKeys] }));
        this.closeCreateConfigKeyDialog();
      }
    });
  };

  handleDeleteClick = () => {
    const { actions } = this.props;
    const id = this.state.configKeyIdForAction;
    this.setState({ deletingConfigKey: true });
    actions.post('delete-config-key', {
      id,
      onResponse: () => this.setState({ deletingConfigKey: false }),
      onFailure: deleteConfigKeyError => this.setState({ deleteConfigKeyError }),
      onSuccess: () => {
        actions.updateApiData(state =>
          ({ configKeys: state.configKeys.filter(conf => conf.id !== id) }));
        this.closeCreateConfigKeyDialog();
      }
    });
  };

  openCreateConfigKeyDialog = () => this.setState({
    ...this.state,
    openCreateConfigKeyDialog: true,
  });

  closeCreateConfigKeyDialog = () => this.setState({
    ...this.state,
    openCreateConfigKeyDialog: false,
    addConfigKey: null,
    addConfigLabel: null,
    addConfigSummary: null
  });

  openDeleteConfirmDialog = (configKeyId) => this.setState({
    ...this.state,
    openDeleteConfirmDialog: true,
    configKeyIdForAction: configKeyId
  });

  closeDeleteConfirmDialog = () => this.setState({
    ...this.state,
    openDeleteConfirmDialog: false,
    configKeyIdForAction: null
  });

  // TODO: Fix margin top to be more generic for all content
  render() {
    const { configKeys } = this.props;
    const { addConfigKey, addConfigLabel, addConfigSummary } = this.state;

    const styles = {
      container: {
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        height: '100%'
      },
      table: { width: '780px' },
      fab: {
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 900
      }
    };

    const createConfigKeyDialog = (
      <Dialog
        open={this.state.openCreateConfigKeyDialog}
        style={{ width: '540px' }}
      >
        <DialogContent>
          <Textfield
            style={{ width: '100%' }}
            floatingLabel
            label='Key'
            onChange={this.handleInputChange.bind(this, 'addConfigKey')}
            value={addConfigKey}
          />

          <Textfield
              style={{ width: '100%' }}
              floatingLabel
              label='Label'
              onChange={this.handleInputChange.bind(this, 'addConfigLabel')}
              value={addConfigLabel}
          />

          <Textfield
              style={{ width: '100%' }}
              floatingLabel
              label='Summary'
              onChange={this.handleInputChange.bind(this, 'addConfigSummary')}
              value={addConfigSummary}

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

    const renderItemActionButton = id => {
      return (
        <div>
          <div style={{ position: 'relative', color: '#999999' }}>
            <IconButton
              name='delete'
              onClick={this.openDeleteConfirmDialog.bind(this, id)}
            />
          </div>
        </div>
      );
    };

    const renderTable = (
      <div>
        <DataTable style={{ width: '780px' }} shadow={0} rows={configKeys}>
          <TableHeader name='configKey'>Key</TableHeader>
          <TableHeader name='label'>Label</TableHeader>
          <TableHeader name='summary'>Summary</TableHeader>
          <TableHeader name='configKeyId' style={{ width: '32px' }} cellFormatter={renderItemActionButton} />
        </DataTable>
      </div>
    );

    const renderEmptyTable = (
        <Card shadow={0} style={{ width: '420px' }}>
          <CardTitle>There are no configuration keys</CardTitle>
          <CardText>
            <span>To create your first configuration key click on the orange icon at the bottom right of the window.</span>
            <br /><br /><br />
          </CardText>
          {/*<CardActions border>*/}
              {/*<Button onClick={this.openCreateConfigKeyDialog} colored>ADD CONFIGURATION KEY</Button>*/}
          {/*</CardActions>*/}
        </Card>
    );

    return (
      <div>
        <FABButton style={styles.fab} colored ripple onClick={this.openCreateConfigKeyDialog}>
            <Icon name='add' />
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

export default List;
