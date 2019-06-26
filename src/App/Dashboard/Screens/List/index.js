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
    this.setState({ loadingScreens: true });
    actions.post('get-screens', {
      scriptId,
      onResponse: () => this.setState({ loadingScreens: false }),
      onFailure: loadScreensError => this.setState({ loadScreensError }),
      onSuccess: ({ payload }) => {
      this.setState({ scripts: payload.scripts });
      actions.updateApiData({ scripts: payload.scripts });
      }
    });
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ screens: [] });
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
    screens: state.apiData.screens || []
  }))
));
