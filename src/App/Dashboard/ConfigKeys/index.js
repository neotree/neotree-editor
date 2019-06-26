import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import List from './List';

export class ConfigKeys extends React.Component {
  state = {};

  componentWillMount() {
    const { actions } = this.props;
    this.setState({ loadingConfigKeys: true });
    actions.post('get-config-keys', {
      onResponse: () => this.setState({ loadingConfigKeys: false }),
      onFailure: loadConfigKeysError => this.setState({ loadConfigKeysError }),
      onSuccess: ({ payload }) => {
        this.setState({ configKeys: payload.configKeys });
        actions.updateApiData({ configKeys: payload.configKeys });
      }
    });
  }

  componentWillUnmount() {
    this.props.actions.updateApiData({ configKeys: [] });
  }

  render() {
    return (
      <div>
        <List {...this.props} />
      </div>
    );
  }
}

ConfigKeys.propTypes = {
  actions: PropTypes.object
};

export default hot(withRouter(
  reduxComponent(ConfigKeys, state => ({
    configKeys: state.apiData.configKeys || []
  }))
));
