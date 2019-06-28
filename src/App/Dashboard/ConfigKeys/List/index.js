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
import Spinner from 'ui/Spinner'; // eslint-disable-line

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDeleteConfirmDialog: false,
      openCreateConfigKeyDialog: false,
      configKeyIdForAction: '',
      configKey: '',
      label: '',
      summary: ''
    };
  }

  handleInputChange = (name, event) => this.setState({
    ...this.state,
    [name]: event.target.value
  });

  handleCreateClick = () => {
    const { actions } = this.props;
    const { configKey, label, summary } = this.state;
    this.setState({ creatingConfigKey: true });
    actions.post('create-config-key', {
      data: JSON.stringify({ configKey, label, summary }),
      onResponse: () => this.setState({ creatingConfigKey: false }),
      onFailure: createConfigKeyError => this.setState({ createConfigKeyError }),
      onSuccess: ({ payload }) => {
        actions.updateApiData(state =>
          ({ configKeys: [payload.configKey, ...state.configKeys] }));
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
        this.closeDeleteConfirmDialog();
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
    configKey: '',
    label: '',
    summary: ''
  });

  openDeleteConfirmDialog = (configKeyId) => this.setState({
    ...this.state,
    openDeleteConfirmDialog: true,
    configKeyIdForAction: configKeyId
  });

  closeDeleteConfirmDialog = () => this.setState({
    ...this.state,
    openDeleteConfirmDialog: false,
    configKeyIdForAction: null,
    deleteScriptError: null,
    createConfigKeyError: null
  });

  // TODO: Fix margin top to be more generic for all content
  render() {
    const { configKeys } = this.props;
    const {
      configKey,
      label,
      summary,
      deletingConfigKey,
      deleteConfigKeyError,
      creatingConfigKey,
      createConfigKeyError
    } = this.state;

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
            onChange={this.handleInputChange.bind(this, 'configKey')}
            value={configKey}
          />

          <Textfield
              style={{ width: '100%' }}
              floatingLabel
              label='Label'
              onChange={this.handleInputChange.bind(this, 'label')}
              value={label}
          />

          <Textfield
              style={{ width: '100%' }}
              floatingLabel
              label='Summary'
              onChange={this.handleInputChange.bind(this, 'summary')}
              value={summary}

          />
          {createConfigKeyError ?
            <div className="ui__dangerColor ui__textAlign_center">
              {createConfigKeyError.msg || createConfigKeyError.message
                || JSON.stringify(createConfigKeyError)}
            </div>
            :
            null}
        </DialogContent>
        <DialogActions>
          {[
            creatingConfigKey ? null :
              <Button type='button' onClick={this.handleCreateClick} accent>Create</Button>,
            creatingConfigKey ? null :
              <Button type='button' onClick={this.closeCreateConfigKeyDialog}>Cancel</Button>,
            creatingConfigKey ? <Spinner size={25} /> : null
          ].map((child, i) => child && React.cloneElement(child, { key: i }))}
        </DialogActions>
      </Dialog>
    );

    const confirmDeleteDialog = (
      <Dialog open={this.state.openDeleteConfirmDialog}>
        {[
          <DialogContent>
            {deletingConfigKey ?
              <Spinner className="ui__flex ui__justifyContent_center" />
              :
              <div>
                {deleteConfigKeyError ?
                  <div className="ui__dangerColor">{deleteConfigKeyError.msg || deleteConfigKeyError.message
                    || JSON.stringify(deleteConfigKeyError)}</div>
                  :
                  <p>Are you sure you want to delete this configuration key?</p>}
              </div>}
          </DialogContent>,
          deletingConfigKey ? null :
            <DialogActions>
              <Button type='button' onClick={this.handleDeleteClick} accent>Delete</Button>
              <Button type='button' onClick={this.closeDeleteConfirmDialog}>Cancel</Button>
            </DialogActions>
        ].map((child, i) => child && React.cloneElement(child, { key: i }))}
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
        <DataTable
          style={{ width: '780px' }} shadow={0}
          rows={configKeys.map(key => ({ id: key.id, ...key.data }))}
        >
          <TableHeader name='configKey'>Key</TableHeader>
          <TableHeader name='label'>Label</TableHeader>
          <TableHeader name='summary'>Summary</TableHeader>
          <TableHeader name='id' style={{ width: '32px' }} cellFormatter={renderItemActionButton} />
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
