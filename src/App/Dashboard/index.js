import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import authenticated from 'authenticated'; // eslint-disable-line

export class Dashboard extends React.Component {
  render() {
    return (
      <div>
        Dashboard
      </div>
    );
  }
}

Dashboard.propTypes = {
  actions: PropTypes.object,
  authenticatedUser: PropTypes.object
};

export default hot(authenticated(reduxComponent(Dashboard, state => ({
  authenticatedUser: state.appStatus.authenticatedUser
}))));
