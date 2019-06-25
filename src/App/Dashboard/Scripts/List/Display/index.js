import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import {
    Button,
    Card,
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

class Display extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDeleteConfirmDialog: false,
      scriptIdForAction: null
    };
  }

  handleAddScriptClick = () => this.props.history
    .push('/dashboard/scripts/new');

  handleEditScriptClick = scriptId => this.props.history
    .push(`/dashboard/scripts/${scriptId}`);

  handleDeleteClick = () => {
    const { actions } = this.props;
    const id = this.state.scriptIdForAction;
    actions.post('delete-script', {
      id,
      onResponse: () => this.setState({ deletingScript: false }),
      onFailure: deleteScriptError => this.setState({ deleteScriptError }),
      onSuccess: () => {
        actions.updateApiData(state =>
          ({ scripts: state.scripts.filter(conf => conf.id !== id) }));
        this.closeDeleteConfirmDialog();
      }
    });
  };

  openDeleteConfirmDialog = scriptId => this.setState({
    ...this.state,
    openDeleteConfirmDialog: true,
    scriptIdForAction: scriptId
  });

  closeDeleteConfirmDialog = () => this.setState({
    ...this.state,
    openDeleteConfirmDialog: false,
    scriptIdForAction: null
  });

  render() {
    const { scripts } = this.props;
    const styles = {
      container: {
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        height: '100%'
      },
      table: {
        width: '640px'
      },
      fab: {
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
      const menuId = `more-user-action-menu${index}`;
      return (
        <div>
          <div style={{ position: 'relative', color: '#999999' }}>
            <IconButton name="edit" onClick={this.handleEditScriptClick.bind(this, scriptId)} />
            <IconButton name="more_vert" id={menuId} />
            <Menu target={menuId} align="right">
                <MenuItem onClick={this.openDeleteConfirmDialog.bind(this, scriptId)}>
                  Delete
                </MenuItem>
            </Menu>
          </div>
        </div>
      );
    };

    // console.log("Rendering script list");
    // console.log(JSON.stringify(scripts, null, 2));

    const renderTable = (
      <div>
        <DataTable style={{ width: '780px' }} shadow={0} rows={scripts}>
          <TableHeader name="title">Title</TableHeader>
          <TableHeader name="description">Description</TableHeader>
          <TableHeader name="scriptId" style={{ width: '64px' }} cellFormatter={renderEditButton} />
        </DataTable>
      </div>
    );

    const renderEmptyTable = (
      <Card shadow={0} style={{ width: '320px' }}>
        <CardTitle>There are no scripts</CardTitle>
        <CardText>
          <span>To create your first script click on the orange icon at the bottom right of the window.</span>
          <br /><br /><br />
        </CardText>
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

Display.propTypes = {
  scripts: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
};

export default hot(Display);
