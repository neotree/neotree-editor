import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardText,
  DataTable,
  TableHeader,
  Menu,
  MenuItem,
} from 'react-mdl';
import { MdDelete, MdCreate, MdMoreVert } from 'react-icons/md';
import Toolbar from 'Toolbar'; // eslint-disable-line
import Spinner from 'ui/Spinner'; // eslint-disable-line
import CopyToClipBoard from 'DashboardComponents/CopyToClipBoard';
import PasteBoard from 'DashboardComponents/PasteBoard';

class Display extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDeleteConfirmDialog: false,
      scriptIdForAction: null
    };
  }

  togglePasteBoard = () => this.setState({ openPasteBoard: !this.state.openPasteBoard });

  handleAddDiagnosisClick = () => {
    const { history, scriptId } = this.props;
    history.push(`/dashboard/scripts/${scriptId}/diagnosis/new`);
  };

  handleDeleteDiagnosisClick = id => () => {
    const { actions, scriptId } = this.props;
    this.setState({ deletingDiagnosis: true });
    actions.post('delete-diagnosis', {
      id,
      scriptId,
      onResponse: () => this.setState({ deletingDiagnosis: false }),
      onFailure: deleteDiagnosisError => this.setState({ deleteDiagnosisError }),
      onSuccess: () => {
        actions.updateApiData(state =>
          ({ diagnoses: state.diagnoses.filter(d => d.id !== id) }));
        this.closeDeleteConfirmDialog();
      }
    });
  };

  handleEditDiagnosisClick = index => () => this.props.onEditDiagnosisClick(index);

  handleInputChange = (name, event) => this.setState({
    ...this.state,
    [name]: event.target.value
  });

  render() {
    const { diagnoses, scriptId } = this.props;

    const styles = {
      diagnosis: {
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
      }
    };

    const renderItemActions = id => {
      return (
        <div
          className="ui__flex ui__alignItems_center"
          style={{ color: '#999999' }}
        >
          <div className="ui__cursor_pointer" style={{ fontSize: '24px' }}>
            <CopyToClipBoard data={JSON.stringify({ dataId: id, dataType: 'diagnosis' })} />
          </div>
          <div
            className="ui__cursor_pointer"
            onClick={this.handleEditDiagnosisClick(id)}
          >
            <MdCreate style={{ fontSize: '24px' }} />
          </div>&nbsp;
          <div
            className="ui__cursor_pointer"
            onClick={this.handleDeleteDiagnosisClick(id)}
          >
            <MdDelete style={{ fontSize: '24px' }} />
          </div>
        </div>
      );
    };

    return (
      <PasteBoard
        modal={{
          onClose: this.togglePasteBoard,
          open: this.state.openPasteBoard,
        }}
        data={{ dataId: scriptId, dataType: 'diagnosis' }}
        redirectTo={payload => `/dashboard/scripts/${scriptId}/diagnosis/${payload.diagnosis.id}`}
      >
        <Card shadow={0} style={styles.diagnosis}>
          <Toolbar title="Diagnosis">
            <div id="add_new" className="ui__cursor_pointer">
              <MdMoreVert style={{ fontSize: '24px' }} />
            </div>
              <div>
                <Menu target="add_new" align="right">
                  <MenuItem onClick={this.handleAddDiagnosisClick}>
                    Add new
                  </MenuItem>
                  <MenuItem onClick={this.togglePasteBoard}>
                    Paste
                  </MenuItem>
                </Menu>
            </div>
          </Toolbar>
          {diagnoses.length > 0 ?
            <DataTable
              style={{ width: '780px' }}
              shadow={0}
              rows={diagnoses.map(d => ({ id: d.id, ...d.data }))}
            >
              <TableHeader name="name">Name</TableHeader>
              <TableHeader name="description">Description</TableHeader>
              <TableHeader name="id" style={{ width: '48px' }} cellFormatter={renderItemActions} />
            </DataTable>
            :
            <CardText>
              <div style={styles.emptyMessageContainer}>
                <div>The list of screens is empty</div>
              </div>
            </CardText>}
        </Card>
      </PasteBoard>
    );
  }
}

Display.propTypes = {
  scriptId: PropTypes.string.isRequired,
  onEditDiagnosisClick: PropTypes.func.isRequired
};

export default Display;
