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
    Menu,
    MenuItem,
    TableHeader
} from 'react-mdl';
import { MdAdd, MdMoreVert, MdCreate } from 'react-icons/md';
import Spinner from 'ui/Spinner'; // eslint-disable-line
import ExportLink from '../../../components/ExportLink';

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
    this.setState({ deletingScript: true });
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

  handleDuplicateScript = id => {
    const { actions } = this.props;
    this.setState({ duplicatingScript: true });
    actions.post('duplicate-script', {
      id,
      onResponse: () => this.setState({ duplicatingScript: false }),
      onFailure: duplicateScriptError => this.setState({ duplicateScriptError }),
      onSuccess: ({ payload }) => {
        actions.updateApiData(state => {
          const scripts = [...state.scripts];
          const ogIndex = scripts.map((s, i) =>
            s.id === id ? i : null).filter(i => i !== null)[0] || 0;
          scripts.splice(ogIndex + 1, 0, payload.script);
          return { scripts };
        });
      }
    });
  };

  // handleExportScript = id => {
  //   const { actions } = this.props;
  //   this.setState({ exportingScript: true });
  //   actions.get('export-data', {
  //     script: id,
  //     onResponse: () => this.setState({ exportingScript: false }),
  //     onFailure: exportScriptError => this.setState({ exportScriptError }),
  //     onSuccess: ({ payload }) => {
  //       console.log(payload);
  //     }
  //   });
  // };

  openDeleteConfirmDialog = scriptId => this.setState({
    ...this.state,
    openDeleteConfirmDialog: true,
    scriptIdForAction: scriptId
  });

  closeDeleteConfirmDialog = () => this.setState({
    ...this.state,
    openDeleteConfirmDialog: false,
    scriptIdForAction: null,
    deleteScriptError: null
  });

  render() {
    const { scripts } = this.props;
    const { deletingScript, deleteScriptError } = this.state;
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
        {[
          <DialogTitle>Delete</DialogTitle>,
          <DialogContent>
            {deletingScript ?
              <Spinner className="ui__flex ui__justifyContent_center" />
              :
              <div>
                {deleteScriptError ?
                  <div className="ui__dangerColor">{deleteScriptError.msg || deleteScriptError.message
                    || JSON.stringify(deleteScriptError)}</div>
                  :
                  <p>Are you sure you want to delete this configuration key?</p>}
              </div>}
          </DialogContent>,
          deletingScript ? null :
            <DialogActions>
              <Button type='button' onClick={this.handleDeleteClick} accent>Delete</Button>
              <Button type='button' onClick={this.closeDeleteConfirmDialog}>Cancel</Button>
            </DialogActions>
        ].map((child, i) => child && React.cloneElement(child, { key: i }))}
      </Dialog>
    );

    const renderEditButton = (scriptId, rowData, index) => {
      //return <IconButton name="edit" onClick={this.handleEditUserClick.bind(this, scriptId)}/>;
      const menuId = `more-user-action-menu${index}`;
      return (
        <div>
          <div
            style={{ position: 'relative', color: '#999999' }}
            className="ui__flex ui__alignItems_center"
          >
            <div
              className="ui__cursor_pointer"
              onClick={this.handleEditScriptClick.bind(this, scriptId)}
            >
              <MdCreate style={{ fontSize: '24px' }} />
            </div>&nbsp;
            <div id={menuId} className="ui__cursor_pointer">
              <MdMoreVert style={{ fontSize: '24px' }} />
            </div>
            <Menu target={menuId} align="right">
                <MenuItem onClick={this.openDeleteConfirmDialog.bind(this, scriptId)}>
                  Delete
                </MenuItem>
                <MenuItem onClick={() => this.handleDuplicateScript(scriptId)}>
                  Duplicate
                </MenuItem>
                <MenuItem>
                  <ExportLink options={{ script: scriptId }} />
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
        <DataTable
          style={{ width: '780px' }}
          shadow={0}
          rows={scripts.map(scr => ({ id: scr.id, ...scr.data }))}
        >
          <TableHeader name="title">Title</TableHeader>
          <TableHeader name="description">Description</TableHeader>
          <TableHeader name="id" style={{ width: '64px' }} cellFormatter={renderEditButton} />
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
            <MdAdd />
        </FABButton>
        <div style={styles.container}>
            {scripts.length ? renderTable : renderEmptyTable}
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
