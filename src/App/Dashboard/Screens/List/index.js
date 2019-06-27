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
    this.setState({ loadingScreens: true });
    actions.get('get-screens', {
      script_id: scriptId,
      onResponse: () => this.setState({ loadingScreens: false }),
      onFailure: loadScreensError => this.setState({ loadScreensError }),
      onSuccess: ({ payload }) => {
      this.setState({ screens: payload.screens });
      actions.updateApiData({ screens: payload.screens });
      }
    });
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ screens: [] });
  }

  render() {
    const { loadingScreens } = this.state;

    if (loadingScreens) return <Spinner className="ui__flex ui__justifyContent_center" />;

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
