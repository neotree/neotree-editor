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
import { MdCreate, MdMoreVert } from 'react-icons/md';
import Toolbar from 'Toolbar'; // eslint-disable-line
import Spinner from 'ui/Spinner'; // eslint-disable-line
import CopyToClipBoard from 'DashboardComponents/CopyToClipBoard';
import PasteBoard from 'DashboardComponents/PasteBoard';
import isMobileBrowser from 'AppUtils/isMobileBrowser';

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

  handleDuplicateDiagnosis = id => {
    const { actions } = this.props;
    this.setState({ duplicatingDiagnosis: true });
    actions.post('duplicate-diagnosis', {
      id,
      onResponse: () => this.setState({ duplicatingDiagnosis: false }),
      onFailure: duplicateDiagnosisError => this.setState({ duplicateDiagnosisError }),
      onSuccess: ({ payload }) => {
        actions.updateApiData(state => {
          const diagnoses = [...state.diagnoses];
          const ogIndex = diagnoses.map((s, i) =>
            s.id === id ? i : null).filter(i => i !== null)[0] || 0;
          diagnoses.splice(ogIndex + 1, 0, payload.diagnosis);
          return { diagnoses };
        });
      }
    });
  };

  render() {
    const { diagnoses, scriptId } = this.props;

    const styles = {
      diagnosis: { overflow: 'unset', width: '100%', minWidth: '700px' },
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
          <div
            className="ui__cursor_pointer"
            onClick={this.handleEditDiagnosisClick(id)}
          >
            <MdCreate style={{ fontSize: '24px' }} />
          </div>&nbsp;
          <div style={{ position: 'relative' }}>
            <div id={`menu_${id}`} className="ui__cursor_pointer">
              <MdMoreVert style={{ fontSize: '24px' }} />
            </div>
            <Menu target={`menu_${id}`} align="right">
              <MenuItem onClick={() => this.handleDuplicateDiagnosis(id)}>
                Duplicate
              </MenuItem>
                <MenuItem>
                  <CopyToClipBoard data={JSON.stringify({ dataId: id, dataType: 'diagnosis' })}>
                    <span>Copy</span>
                  </CopyToClipBoard>
                </MenuItem>
                <MenuItem onClick={this.handleDeleteDiagnosisClick(id)}>
                  Delete
                </MenuItem>
            </Menu>
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
        accept="diagnosis"
        data={{ dataId: scriptId, dataType: 'diagnosis' }}
        redirectTo={payload => `/dashboard/scripts/${scriptId}/diagnosis/${payload.diagnosis.id}`}
      >
        <Card shadow={0} style={styles.diagnosis}>
          <Toolbar title="Diagnosis">
            <div style={{ position: 'relative' }}>
              <div id="add_new" className="ui__cursor_pointer">
                <MdMoreVert style={{ fontSize: '24px' }} />
              </div>
                <div>
                  <Menu target="add_new" align="right">
                    <MenuItem onClick={this.handleAddDiagnosisClick}>
                      Add new
                    </MenuItem>
                    {isMobileBrowser() ?
                      <MenuItem onClick={this.togglePasteBoard}>
                        Paste
                      </MenuItem> : null}
                  </Menu>
              </div>
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
