import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Display from './Display';

export class List extends React.Component {
  state = {};

  componentWillMount() {
    const { actions, scriptId } = this.props;
    this.setState({ loadingDiagnoses: true });
    actions.post('get-diagnoses', {
      scriptId,
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
