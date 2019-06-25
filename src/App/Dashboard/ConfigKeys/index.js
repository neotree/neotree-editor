import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import List from './List';

export class ConfigKeys extends React.Component {
  componentWillMount() {
    setTimeout(() => this.props.actions.updateApiData({
      configKeys: [
        {
          id: '-KNx1hamQK7hWcS7BZ8d',
          configKey: 'Offline',
          configKeyId: '-KNx1hamQK7hWcS7BZ8d',
          createdAt: 1469902936651,
          label: 'Offline mode only',
          source: 'editor',
          summary: 'Set offline mode'
        },
        {
          id: '-KOumRfEbH0-ZmNmqx4X',
          configKey: 'NoPulseOx',
          configKeyId: '-KOumRfEbH0-ZmNmqx4X',
          createdAt: 1470938860364,
          label: 'Pulse oximeter unavailable',
          source: 'editor',
          summary: 'Set no pulse oximeter mode'
        },
        {
          id: '-KOumf97Eyh88wnz_Aq1',
          configKey: 'NoBSmon',
          configKeyId: '-KOumf97Eyh88wnz_Aq1',
          createdAt: 1470938919683,
          label: 'Blood sugar monitor not available',
          source: 'editor',
          summary: 'Set no blood sugar monitor mode '
        }
      ]
    }), 2000);
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
