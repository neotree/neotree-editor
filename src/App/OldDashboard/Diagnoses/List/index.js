import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Spinner from 'ui/Spinner'; // eslint-disable-line
import Display from './Display';

export class List extends React.Component {
  state = {};

  componentWillMount() {
    const { actions, scriptId } = this.props;
    this.setState({ loadingDiagnoses: true });
    actions.get('get-diagnoses', {
      script_id: scriptId,
      onResponse: () => this.setState({ loadingDiagnoses: false }),
      onFailure: loadDiagnosesError => this.setState({ loadDiagnosesError }),
      onSuccess: ({ payload }) => {
      this.setState({ diagnoses: payload.diagnoses });
      actions.updateApiData({ diagnoses: payload.diagnoses });
      }
    });
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ diagnoses: [] });
  }

  render() {
    const { loadingDiagnosess } = this.state;

    if (loadingDiagnosess) return <Spinner className="ui__flex ui__justifyContent_center" />;

    return <Display {...this.props} />;
  }
}

List.propTypes = {
  actions: PropTypes.object
};

export default hot(withRouter(
  reduxComponent(List, state => ({
    diagnoses: state.apiData.diagnoses || []
  }))
));
