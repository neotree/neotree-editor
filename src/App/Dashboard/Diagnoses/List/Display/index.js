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
import { MdCreate, MdMoreVert, MdAdd } from 'react-icons/md';
import Toolbar from 'Toolbar';
import Spinner from 'AppComponents/Spinner';
import Api from 'AppUtils/Api';
import Copy from 'Dashboard/Scripts/CopyItems';

class Display extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
      openDeleteConfirmDialog: false,
      scriptIdForAction: null
    };
  }

  handleAddDiagnosisClick = () => {
    const { history, scriptId } = this.props;
    history.push(`/dashboard/scripts/${scriptId}/diagnosis/new`);
  };

  handleDeleteDiagnosisClick = id => () => {
    const { updateState, scriptId } = this.props;
    this.setState({ deletingDiagnosis: true });
    Api.post('/delete-diagnosis', { id, scriptId })
      .then(() => {
        this.setState({ deletingDiagnosis: false });
        updateState(state =>
          ({ diagnoses: state.diagnoses.filter(d => d.id !== id) }));
        this.closeDeleteConfirmDialog();
      }).catch(deleteDiagnosisError => this.setState({
        deleteDiagnosisError,
        deletingDiagnosis: false
      }));
  };

  handleEditDiagnosisClick = index => () => this.props.onEditDiagnosisClick(index);

  handleInputChange = (name, event) => this.setState({
    ...this.state,
    [name]: event.target.value
  });

  handleDuplicateDiagnosis = id => {
    const { updateState } = this.props;
    this.setState({ duplicatingDiagnosis: true });
    Api.post('/duplicate-diagnosis', { id })
      .then(({ payload }) => {
        this.setState({ duplicatingDiagnosis: false });
        updateState(state => {
          const diagnoses = [...state.diagnoses];
          const ogIndex = diagnoses.map((s, i) =>
            s.id === id ? i : null).filter(i => i !== null)[0] || 0;
          diagnoses.splice(ogIndex + 1, 0, payload.diagnosis);
          return { diagnoses };
        });
      })
      .catch(duplicateDiagnosisError => this.setState({
        duplicateDiagnosisError,
        duplicatingDiagnosis: false
      }));
  };

  render() {
    const { diagnoses, match, updateState } = this.props;
    const { selected } = this.state;

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
              {/*<MenuItem onClick={() => this.handleDuplicateDiagnosis(id)}>*/}
              {/*  Duplicate*/}
              {/*</MenuItem>*/}
                <MenuItem onClick={this.handleDeleteDiagnosisClick(id)}>
                  Delete
                </MenuItem>
            </Menu>
          </div>
        </div>
      );
    };

    return (
      <div>
        <Card shadow={0} style={styles.diagnosis}>
          <Toolbar title="Diagnosis">
            {selected.length > 0 && (
              <Copy
                itemsType="diagnoses"
                data={{ ids: diagnoses.map(d => selected.map(s => `${s}`).includes(`${d.id}`) ? d.id : null).filter(id => id !== null) }}
                onSuccess={(items, script_id) => {
                  if (match.params.scriptId === script_id) {
                    updateState(({ diagnoses }) => ({
                      diagnoses: [...diagnoses, ...items]
                    }));
                  }
                }}
              />
            )}
            <div onClick={this.handleAddDiagnosisClick} className="ui__cursor_pointer">
              <MdAdd style={{ fontSize: '24px' }} />
            </div>
          </Toolbar>
          {diagnoses.length > 0 ?
            <DataTable
              selectable
              onSelectionChanged={sel => this.setState({
                selected: sel.map(index => diagnoses.filter((d, i) => i === index)[0])
                  .filter(d => d)
                  .map(d => d.id)
              })}
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
      </div>
    );
  }
}

Display.propTypes = {
  scriptId: PropTypes.string.isRequired,
  onEditDiagnosisClick: PropTypes.func.isRequired
};

export default Display;