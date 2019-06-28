import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Card,
    CardText,
    Textfield,
} from 'react-mdl';
import Base64ImageUploader from 'Dashboard/components/Base64ImageUploader'; // eslint-disable-line
import FormButtonBar from 'FormButtonBar'; // eslint-disable-line
import FormSection from 'FormSection'; // eslint-disable-line
import Toolbar from 'Toolbar'; // eslint-disable-line
import SymptomList from '../metadata/SymptomList';

export class Display extends React.Component {
  state = {
    diagnosis: this.props.diagnosis ? this.props.diagnosis.data : {
      name: null,
      description: null,
      expression: null,
      text1: null,
      image1: null,
      text2: null,
      image2: null,
      text3: null,
      image3: null,
      symptoms: null
    }
  };

  componentWillUpdate(nextProps) {
    if (nextProps.diagnosis !== this.props.diagnosis) {
      this.setDiagnosisAsState(nextProps);
    }
  }

  setDiagnosisAsState = (props = this.props) => {
    if (props.diagnosis) this.setState({ diagnosis: props.diagnosis.data });
  };

  handleInputChange = (name, event) => this.setState({
    isModified: true,
    diagnosis: {
      ...this.state.diagnosis,
      [name]: event.target.value,
    }
  });

  handleImageUpload = (name, fileInfo) => this.setState({ [name]: fileInfo });

  handleImageDelete = (name) => this.setState({ [name]: null });

  handleBackClick = () => this.props.history.goBack();

  handleSubmitClick = () => {
    const { isEditMode, history, actions, diagnosisId } = this.props;
    const { diagnosis } = this.state;

    this.setState({ savingDiagnosis: true });
    actions.post(isEditMode ? 'update-diagnosis' : 'create-diagnosis', {
      ...(diagnosisId ? { id: diagnosisId } : {}),
      data: JSON.stringify(diagnosis),
      onResponse: () => this.setState({ savingDiagnosis: true }),
      onFailure: saveDiagnosisError => this.setState({ saveDiagnosisError }),
      onSuccess: ({ payload }) => {
        actions.updateApiData({ diagnosis: payload.diagnosis });
        history.goBack();
      }
    });
  };

  handleUpdateSymptoms = (update) => this.setState({
    diagnosis: {
      ...this.state.diagnosis,
      symptoms: update.symptoms
    }
  });

  render() {
    const { isEditMode } = this.props;
    const { diagnosis } = this.state;
    const formTitle = isEditMode ? 'Edit Diagnosis' : 'Add Diagnosis';
    const actionLabel = isEditMode ? 'Update' : 'Create';
    const styles = {
      container: {
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        height: '100%'
      },
      form: { width: '780px' },
      flexContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%'
      },
      fieldLeft: { marginRight: '12px' },
      fieldMiddle: { marginLeft: '12px', marginRight: '12px' },
      fieldRight: { marginLeft: '12px' }
    };

    return (
      <div style={styles.container}>
        <div>
          <Card shadow={1} style={styles.form}>
            <Toolbar leftNavIcon='arrow_back' title={formTitle} onLeftNavItemClicked={this.handleBackClick} />

            <CardText>
              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label='Name'
                  required
                  onChange={this.handleInputChange.bind(this, 'name')}
                  value={diagnosis.name || ''}
              />

              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label='Description'
                  value={diagnosis.description || ''}
                  onChange={this.handleInputChange.bind(this, 'description')}
              />

              {!isEditMode ? null :
                <div>
                    <Textfield
                      style={{ width: '100%' }}
                      floatingLabel
                      label='Diagnosis expression'
                      required
                      value={diagnosis.expression || ''}
                      onChange={this.handleInputChange.bind(this, 'expression')}
                    />
                    <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '12px' }} >
                      Note: Usual expression syntax plus <span style={{ fontWeight: 'bold' }} >$riskCount</span> and <span style={{ fontWeight: 'bold' }} >$signCount</span> containing the number of expressions that match a risk factor or a sign/symptom
                    </div>

                  <div style={styles.flexContainer}>
                    <Textfield
                      style={{ width: '100%' }}
                      floatingLabel
                      label='Text 1'
                      rows={6}
                      onChange={this.handleInputChange.bind(this, 'text1')}
                      value={diagnosis.text1 || ''}
                    />

                    <div style={styles.fieldRight}>
                      <Base64ImageUploader
                        name={'image1'}
                        fileInfo={diagnosis.image1}
                        onFileUploaded={this.handleImageUpload}
                        onFileDeleted={this.handleImageDelete}
                      />
                    </div>
                  </div>

                  <div style={styles.flexContainer}>
                    <Textfield
                      style={{ width: '100%' }}
                      floatingLabel
                      label='Text 2'
                      rows={6}
                      onChange={this.handleInputChange.bind(this, 'text2')}
                      value={diagnosis.text2 || ''}
                    />

                    <div style={styles.fieldRight}>
                      <Base64ImageUploader
                        name={'image2'}
                        fileInfo={diagnosis.image2}
                        onFileUploaded={this.handleImageUpload}
                        onFileDeleted={this.handleImageDelete}
                      />
                    </div>
                  </div>

                  <div style={styles.flexContainer}>
                    <Textfield
                      style={{ width: '100%' }}
                      floatingLabel
                      label='Text 3'
                      rows={6}
                      onChange={this.handleInputChange.bind(this, 'text3')}
                      value={diagnosis.text3 || ''}
                    />
                    <div style={styles.fieldRight}>
                        <Base64ImageUploader
                          name={'image3'}
                          fileInfo={diagnosis.image3}
                          onFileUploaded={this.handleImageUpload}
                          onFileDeleted={this.handleImageDelete}
                        />
                    </div>
                  </div>
                </div>}

              <FormButtonBar>
                {(isEditMode) ? <Button style={{ ...styles.fieldLeft }} onClick={this.handleSubmitClick.bind(this, 'apply')} raised ripple>Apply</Button> : null }
                <Button style={{ ...styles.fieldRight }} onClick={this.handleSubmitClick.bind(this, 'update')} raised accent ripple>{actionLabel}</Button>
              </FormButtonBar>
            </CardText>
          </Card>

          <SymptomList items={diagnosis.symptoms} onUpdateSymptoms={this.handleUpdateSymptoms} />
        </div>
      </div>
    );
  }
}

Display.propTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default Display;
