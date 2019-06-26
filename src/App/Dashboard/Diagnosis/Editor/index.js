import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Display from './Display';

export class ScriptEditor extends React.Component {
  state = {};

  componentWillMount() {
    const { scriptId, diagnosisId, actions, isEditMode } = this.props;

    if (isEditMode) {
      this.setState({ loadingScript: true });
      actions.post('get-diagnosis', {
         id: diagnosisId,
         scriptId,
         onResponse: () => this.setState({ loadingScript: false }),
         onFailure: loadScriptError => this.setState({ loadScriptError }),
         onSuccess: ({ payload }) => {
           this.setState({ diagnosis: payload.diagnosis });
           actions.updateApiData({ diagnosis: payload.diagnosis });
         }
      });
    }
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ diagnosis: null });
  }

  render() {
    return <Display {...this.props} />;
  }
}

ScriptEditor.propTypes = {
  actions: PropTypes.object,
  diagnosisId: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired
};

export default hot(withRouter(
  reduxComponent(ScriptEditor, (state, ownProps) => ({
    diagnosis: state.apiData.diagnosis,
    diagnosisId: ownProps.match.params.diagnosisId,
    scriptId: ownProps.match.params.scriptId,
    isEditMode: state.apiData.diagnosis ? true : false
  }))
));
