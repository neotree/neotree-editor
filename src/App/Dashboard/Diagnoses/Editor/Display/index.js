import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Card,
    CardText,
    Textfield,
} from 'react-mdl';
import Base64ImageUploader, { _uploadFile as uploadFile } from 'Dashboard/components/Base64ImageUploader';
import FormButtonBar from 'FormButtonBar';
import FormSection from 'FormSection';
import Toolbar from 'Toolbar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
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

  handleImageUpload = (name, fileInfo) => this.setState({
    diagnosis: {
      ...this.state.diagnosis,
      [name]: fileInfo
    }
  });

  handleImageDelete = (name) => this.setState({
      diagnosis: {
        ...this.state.diagnosis,
        [name]: null
      }
  });

  handleBackClick = () => this.props.history.goBack();

  handleSubmitClick = (shouldGoBack = true) => {
    const { isEditMode, history, actions, diagnosisId, scriptId } = this.props;
    const { diagnosis } = this.state;

    this.setState({ savingDiagnosis: true });
    actions.post(isEditMode ? 'update-diagnosis' : 'create-diagnosis', {
      ...(isEditMode ? { id: diagnosisId } : {}),
      script_id: scriptId,
      data: JSON.stringify(diagnosis),
      onResponse: () => this.setState({ savingDiagnosis: true }),
      onFailure: saveDiagnosisError => this.setState({ saveDiagnosisError }),
      onSuccess: ({ payload }) => {
        actions.updateApiData({ diagnosis: payload.diagnosis });
        if (shouldGoBack) history.goBack();
      }
    });
  };

  handleUpdateSymptoms = (update) => this.setState({
    diagnosis: {
      ...this.state.diagnosis,
      symptoms: update.symptoms
    }
  });

  getUploadableFiles = () => {
    const { diagnosis: { image1, image2, image3 } } = this.state || {};
    const uploadable = [];
    if (image1 || image2 || image3) {
      const addUploadable = (name, img) => img && !img.fileId && uploadable.push({ name, img });
      addUploadable('image1', image1);
      addUploadable('image2', image2);
      addUploadable('image3', image3);
    }
    return uploadable;
  };

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
                {(isEditMode) ? <Button style={{ ...styles.fieldLeft }} onClick={this.handleSubmitClick.bind(this)} raised ripple>Apply</Button> : null }
                <Button style={{ ...styles.fieldRight }} onClick={this.handleSubmitClick.bind(this)} raised accent ripple>{actionLabel}</Button>
              </FormButtonBar>
            </CardText>
          </Card>

          <SymptomList items={diagnosis.symptoms} onUpdateSymptoms={this.handleUpdateSymptoms} />
        </div>

        <Dialog
          fullWidth
          maxWidth="sm"
          open={this.getUploadableFiles().length > 0}
          onClose={() => {}}
        >
          <DialogTitle>These images must be saved in the database</DialogTitle>

          <DialogContent>
            {this.getUploadableFiles().map((f, i) => {
              return (
                <div key={i}>
                  <div
                    style={{
                      width: '90%',
                      maxWidth: 200,
                      margin: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      style={{ width: '100%', height: 'auto' }}
                      role="presentation"
                      src={f.img.data}
                    />
                  </div>
                  <br />
                </div>
              );
            })}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                const files = this.getUploadableFiles();
                this.setState({ uploadingFiles: true });
                Promise.all(files.map(({ img: f }) => {
                  const dataURI = f.data;
                  const byteString = atob(dataURI.split(',')[1]);
                  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                  const ab = new ArrayBuffer(byteString.length);
                  const ia = new Uint8Array(ab);
                  for (let i = 0; i < byteString.length; i++) {
                      ia[i] = byteString.charCodeAt(i);
                  }
                  const blob = new Blob([ab], { type: mimeString, });
                  return uploadFile(new File([blob], f.filename));
                }))
                  .catch(e => {
                    this.setState({ uploadingFiles: false });
                    alert(e.msg || e.message || JSON.stringify(e));
                  })
                  .then(rslts => {
                    const update = {};
                    rslts.forEach((f, i) => { update[files[i].name] = f; });
                    this.setState({
                      uploadingFiles: false,
                      ...update,
                    }, () => this.handleSubmitClick());
                  });
              }}
            >{this.state.uploadingFiles ? <CircularProgress size={15} /> : 'Save'}</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

Display.propTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default Display;
