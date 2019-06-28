import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardText,
  DataTable,
  IconButton,
  TableHeader
} from 'react-mdl';
import Toolbar from 'Toolbar'; // eslint-disable-line
import Spinner from 'ui/Spinner'; // eslint-disable-line

class Display extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDeleteConfirmDialog: false,
      scriptIdForAction: null
    };
  }

  handleAddDiagnosisClick = () => this.props.history
    .push('/dashboard/diagnosis/new');

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
    const { diagnoses } = this.props;

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
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignContent: 'end',
            color: '#999999'
          }}
        >
          <IconButton name="edit" onClick={this.handleEditDiagnosisClick(id)} />
          <IconButton name="delete" onClick={this.handleDeleteDiagnosisClick(id)} />
        </div>
      );
    };

    return (
      <div>
        <Card shadow={0} style={styles.diagnosis}>
          <Toolbar title="Diagnosis">
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <IconButton name="add" onClick={this.handleAddDiagnosisClick} />
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
      </div>
    );
  }
}

Display.propTypes = {
  scriptId: PropTypes.string.isRequired,
  onEditDiagnosisClick: PropTypes.func.isRequired
};

export default Display;