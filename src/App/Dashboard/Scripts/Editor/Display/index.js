import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardText, Textfield, Tab, Tabs } from 'react-mdl';
import FormButtonBar from 'FormButtonBar'; // eslint-disable-line
import Toolbar from 'Toolbar'; // eslint-disable-line
import ScreensList from '../../../Screens/List';
import DiagnosisList from '../../../Diagnoses/List';

export default class Display extends Component {
  state = {
    activeTab: 0,
    script: {
      title: '',
      description: ''
    }
  };

  handleBackClick = () => this.props.history.goBack();

  handleEditScreenClick = index => {
    const { scriptId, history } = this.props;
    history.push(`/dashboard/scripts/${scriptId}/screens/${index}`);
  };

  handleEditDiagnosisClick = (index) => {
    const { scriptId, history } = this.props;
    history.push(`/dashboard/scripts/${scriptId}/diagnosis/${index}`);
  };

  handleInputChange = (name, event) => this.setState({
    script: { ...this.state.script, [name]: event.target.value }
  });

  handleSubmitClick = () => {
    const { isEditMode, history, actions, scriptId } = this.props;
    const { script } = this.state;

    this.setState({ savingScript: true });
    actions.post(isEditMode ? 'update-script' : 'create-script', {
      id: scriptId,
      title: script.title,
      description: script.description,
      onResponse: () => this.setState({ savingScript: true }),
      onFailure: saveScriptError => this.setState({ saveScriptError }),
      onSuccess: ({ payload }) => {
        actions.updateApiData({ script: payload.script });
        history.goBack();
      }
    });
  };

  render() {
    const { isEditMode, scriptId } = this.props;
    const { activeTab, script } = this.state;
    const formTitle = `${isEditMode ? 'Edit' : 'Add'} script`;
    const actionLabel = isEditMode ? 'Update' : 'Create';

    const styles = {
      container: {
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        height: '100%'
      },
      form: {
          width: '780px'
      },
      fieldLeft: {
          marginRight: '12px'
      },
      fieldRight: {
          marginLeft: '12px'
      }
    };

    // console.log('Rendering');
    // console.log(JSON.stringify(screens, null, 2));
    let activeList;
    switch (activeTab) {
      case 0:
        activeList = <ScreensList scriptId={scriptId} onEditScreenClick={this.handleEditScreenClick} />;
        break;
      case 1:
        activeList = <DiagnosisList scriptId={scriptId} onEditDiagnosisClick={this.handleEditDiagnosisClick} />;
        //activeList = null;
        break;
      default:
        activeList = null;
    }

    const tabs = (
      <div style={{ marginTop: '24px' }}>
        <Tabs activeTab={activeTab} onChange={(tabId) => this.setState({ activeTab: tabId })} ripple>
          <Tab>Screens</Tab>
          <Tab>Diagnosis</Tab>
        </Tabs>
        <section>{activeList}</section>
      </div>
    );

    return (
      <div style={styles.container}>
        <div>
          <Card shadow={0} style={styles.form}>
            <Toolbar leftNavIcon="arrow_back" title={formTitle} onLeftNavItemClicked={this.handleBackClick} />
            <CardText>
              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label="Title"
                  required
                  onChange={this.handleInputChange.bind(this, 'title')}
                  value={script.title}
              />

              <Textfield
                  style={{ width: '100%' }}
                  floatingLabel
                  label="Description"
                  value={script.description}
                  onChange={this.handleInputChange.bind(this, 'description')}
              />

              <FormButtonBar>
                  {isEditMode ?
                    <Button
                      style={{ ...styles.fieldLeft }}
                      onClick={this.handleSubmitClick.bind(this, 'apply')}
                      raised
                      ripple
                    >Apply</Button> : null }

                  <Button
                    style={{ ...styles.fieldRight }}
                    onClick={this.handleSubmitClick.bind(this, 'update')}
                    raised
                    accent
                    ripple
                  >{actionLabel}</Button>
              </FormButtonBar>
            </CardText>
          </Card>

          { (isEditMode) ? tabs : null }
        </div>
      </div>
    );
  }
}

Display.propTypes = {
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  scriptId: PropTypes.string.isRequired,
  script: PropTypes.object,
};
