import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent';
import {
    Button,
    Card,
    CardText,
    Textfield,
    Switch
} from 'react-mdl';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormButtonBar from 'FormButtonBar';
import FormSection from 'FormSection';
import Toolbar from 'Toolbar';
// import { DataType, ScreenType } from 'App/constants';
import * as constants from 'App/constants';
import DialogTitle from '@material-ui/core/DialogTitle';
import SelectMetadata from '../metadata/SelectMetadata';
import FieldList from '../metadata/FieldList';
import ItemList from '../metadata/ItemList';
import ManagementMetadata, { uploadFile } from '../metadata/ManagementMetadata';
import TimerMetadata from '../metadata/TimerMetadata';
import YesNoMetadata from '../metadata/YesNoMetadata';

export class Editor extends React.Component {
  state = {
    openUnsavedChangesDialog: false,
    isModified: false,
    isModifiedConfirmed: false,
    skippable: false,
    screen: {
      epicId: null,
      storyId: null,
      refId: null,
      step: null,
      type: null,
      title: null,
      sectionTitle: null,
      actionText: null,
      contentText: null,
      infoText: null,
      notes: null,
      condition: null,
      metadata: {}
    }
  };

  componentWillMount() {
    this.setScreenAsState(this.props);
  }

  componentWillUpdate(nextProps) {
    if (JSON.stringify(nextProps.screen || {}) !== JSON.stringify(this.props.screen || {})) {
      this.setScreenAsState(nextProps);
    }
  }

  setScreenAsState = (props = this.props) => {
    if (props.screen) {
      const newState = {
        type: props.screen.type,
        screen: { ...props.screen.data, type: props.screen.type }
      };
      this.setState(newState);
    }
  };

  // getChildContext = () => ({ screenType: this.state.screen.type });

  handleInputChange = (name, e) => this.setState({
    isModified: true,
    screen: { ...this.state.screen, [name]: e.target.value }
  });

  handleSwitchChange = name => () => this.setState({
    [name]: !(this.state[name] ? this.state[name] : false)
  });

  handleBackClick = () => this.props.history.goBack();

  handleSubmitClick = (shouldGoBack = true) => {
    const { actions, history, isEditMode, screenId } = this.props;
    const { screen } = this.state;
    const action = isEditMode ? 'update-screen' : 'create-screen';
    this.setState({ updatingScreen: true });
    actions.post(action, {
      id: screenId,
      data: JSON.stringify(screen),
      onResponse: () => this.setState({ updatingScreen: false }),
      onFailure: updateScreenError => this.setState({ updateScreenError }),
      onSuccess: ({ payload }) => {
      this.setState({ screen: payload.screen.data });
        actions.updateApiData({ screen: payload.screen });
        if (shouldGoBack && (action === 'update-screen')) history.goBack();
      }
    });
  };

  handleItemsChanged = () => this.setState({ isModified: true });

  handleUpdateMetadata = (update, shouldSaveAfter = false) => {
    this.setState({
      screen: {
        // ...this.props.screen,
        ...this.state.screen,
        metadata: {
          // ...this.props.screen.metadata,
          ...this.state.screen.metadata,
          ...update
        }
      }
    }, () => shouldSaveAfter && this.handleSubmitClick(false));
  };

  openUnsavedChangesDialog = () => () => this.setState({
    openUnsavedChangesDialog: true
  });

  closeUnsavedChangesDialog = () => this.setState({
    openUnsavedChangesDialog: false
  });

  getUploadableFiles = () => {
    const { metadata: { image1, image2, image3 } } = this.state.screen || {};
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
    const { type, screen, skippable } = this.state;
    // const type = (this.props.screen || {}).type;

    const styles = {
      container: {
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        // height: '100%'
      },
      form: {
        width: '780px'
      },
      flexContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%'
      },
      fieldLeft: {
        marginRight: '12px'
      },
      fieldMiddle: {
        marginLeft: '12px',
        marginRight: '12px'
      },
      fieldRight: {
        marginLeft: '12px'
      }
    };

    let metadataEditor = null;
    let itemsEditor = null;

    switch (type) {
      case constants.ScreenType.CHECKLIST:
      case constants.ScreenType.LIST:
      case constants.ScreenType.PROGRESS:
      case constants.ScreenType.MULTI_SELECT:
      case constants.ScreenType.SINGLE_SELECT:
        if (type === constants.ScreenType.MULTI_SELECT || type === constants.ScreenType.SINGLE_SELECT) {
          metadataEditor = <SelectMetadata metadata={screen.metadata} onUpdateMetadata={this.handleUpdateMetadata} />;
        }

        itemsEditor = (
          <ItemList
            metadata={screen.metadata}
            screenType={type}
            onItemsChanged={this.handleItemsChanged}
            onUpdateMetadata={this.handleUpdateMetadata}
          />
        );
        break;
      case constants.ScreenType.FORM:
        itemsEditor = (
          <FieldList
            metadata={screen.metadata}
            onFieldsChanged={this.handleItemsChanged}
            onUpdateMetadata={this.handleUpdateMetadata}
          />
        );
        break;
      case constants.ScreenType.TIMER:
        metadataEditor = <TimerMetadata metadata={screen.metadata} onUpdateMetadata={this.handleUpdateMetadata} />;
        break;
      case constants.ScreenType.YESNO:
        metadataEditor = <YesNoMetadata metadata={screen.metadata} onUpdateMetadata={this.handleUpdateMetadata} />;
        break;
      case constants.ScreenType.MANAGEMENT:
        metadataEditor = <ManagementMetadata metadata={screen.metadata} onUpdateMetadata={this.handleUpdateMetadata} />;
        break;
      default:
        metadataEditor = null;
        itemsEditor = null;
    }

    const confirmUnsavedChangesDialog = (
      <Dialog
        open={this.state.openUnsavedChangesDialog}
        onClose={() => {}}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <p>You have unsaved changes. If you continue they will be lost.</p>
        </DialogContent>
        <DialogActions>
          {/*<Button type='button' onClick={this.handleDeleteItemClick} accent>Delete</Button>*/}
          {/*<Button type='button' onClick={this.closeConfirmDeleteItemDialog}>Cancel</Button>*/}
        </DialogActions>
      </Dialog>
    );

    return (
      <div style={styles.container}>
        <div>
          <Card shadow={1} style={styles.form}>
            <Toolbar leftNavIcon='arrow_back' title='Edit Screen' onLeftNavItemClicked={this.handleBackClick} />
            <CardText>
              <FormSection label='FLOW CONTROL' />

              <div style={{ width: '100%', display: 'flex', alignContent: 'flex-end', marginBottom: '24px' }}>
                <Switch
                  id='screenSkippable'
                  checked={skippable || false}
                  onChange={this.handleSwitchChange('skippable')}
                >
                    Allow the user to skip this screen
                </Switch>
              </div>

              <Textfield
                style={{ width: '100%' }}
                floatingLabel
                label='Conditional expression'
                value={screen.condition || ''}
                onChange={this.handleInputChange.bind(this, 'condition')}
              />
              <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '12px' }}>
                Example: <span style={{ fontWeight: 'bold' }}>($key = true and $key2 = false) or $key3 = 'HD'</span>
              </div>

              <FormSection label='PROPERTIES' topSpace />

              <div style={styles.flexContainer}>
                  <Textfield
                      style={{ flex: 1, ...styles.fieldLeft }}
                      floatingLabel
                      label='Epic ID'
                      onChange={this.handleInputChange.bind(this, 'epicId')}
                      value={screen.epicId || ''}
                  />
                  <Textfield
                      style={{ flex: 1, ...styles.fieldMiddle }}
                      floatingLabel
                      label='Story ID'
                      onChange={this.handleInputChange.bind(this, 'storyId')}
                      value={screen.storyId || ''}
                  />
                  <Textfield
                      style={{ flex: 1, ...styles.fieldMiddle }}
                      floatingLabel
                      label='Ref.'
                      onChange={this.handleInputChange.bind(this, 'refId')}
                      value={screen.refId || ''}
                  />
                  <Textfield
                      style={{ flex: 1, ...styles.fieldLeft }}
                      floatingLabel
                      label='Step'
                      onChange={this.handleInputChange.bind(this, 'step')}
                      value={screen.step || ''}
                  />
              </div>

              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label='Title'
                  required
                  onChange={this.handleInputChange.bind(this, 'title')}
                  value={screen.title || ''}
              />

              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label='Print section title'
                  required
                  onChange={this.handleInputChange.bind(this, 'sectionTitle')}
                  value={screen.sectionTitle || ''}
              />

              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label='Action'
                  value={screen.actionText || ''}
                  onChange={this.handleInputChange.bind(this, 'actionText')}
              />

              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label='Content'
                  rows={6}
                  value={screen.contentText || ''}
                  onChange={this.handleInputChange.bind(this, 'contentText')}
              />

              {/*{(metadataEditor != null) ? <FormSection label='CUSTOM PROPERTIES' topSpace />: null}*/}

              {metadataEditor}

              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label='Instructions'
                  rows={6}
                  value={screen.infoText || ''}
                  onChange={this.handleInputChange.bind(this, 'infoText')}
              />

              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label='Notes'
                  rows={6}
                  value={screen.notes || ''}
                  onChange={this.handleInputChange.bind(this, 'notes')}
              />

              <FormButtonBar>
                  <Button style={{ ...styles.fieldLeft }} onClick={this.handleSubmitClick.bind(this, 'apply')} raised ripple>Apply</Button>
                  <Button style={{ ...styles.fieldRight }} onClick={this.handleSubmitClick.bind(this, 'update')} raised accent ripple>Update</Button>
              </FormButtonBar>
            </CardText>
          </Card>
          {itemsEditor}
        </div>
        {confirmUnsavedChangesDialog}

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
                    this.setState({ uploadingFiles: false });
                    this.handleUpdateMetadata(update, true);
                  });
              }}
            >{this.state.uploadingFiles ? <CircularProgress size={15} /> : 'Save'}</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

Editor.propTypes = {
  actions: PropTypes.object
};

export default hot(withRouter(reduxComponent(Editor, (state, ownProps) => ({
  screen: state.apiData.screen,
  screenId: ownProps.match.params.screenId,
  scriptId: ownProps.match.params.scriptId,
}))));
