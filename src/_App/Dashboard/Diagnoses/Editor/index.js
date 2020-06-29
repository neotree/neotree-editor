import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; 
import Display from './Display';
import Spinner from 'AppComponents/Spinner'; 

export class DiagnosisEditor extends React.Component {
  state = {};

  componentWillMount() {
    const { diagnosisId, actions } = this.props;
    if (diagnosisId && (diagnosisId !== 'new')) {
      this.setState({ loadingDiagnosis: true });
      actions.get('get-diagnosis', {
         id: diagnosisId,
         onResponse: () => this.setState({ loadingDiagnosis: false }),
         onFailure: loadDiagnosisError => this.setState({ loadDiagnosisError }),
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
    const { loadingDiagnosis } = this.state;

    if (loadingDiagnosis) return <Spinner className="ui__flex ui__justifyContent_center" />;

    return <Display {...this.props} />;
  }
}

DiagnosisEditor.propTypes = {
  actions: PropTypes.object,
  diagnosisId: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired
};

export default hot(withRouter(
  reduxComponent(DiagnosisEditor, (state, ownProps) => ({
    diagnosis: state.apiData.diagnosis,
    diagnosisId: ownProps.match.params.diagnosisId,
    scriptId: ownProps.match.params.scriptId,
    isEditMode: state.apiData.diagnosis ? true : false
  }))
));
