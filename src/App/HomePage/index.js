import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import LazyComponent from 'LazyComponent'; // eslint-disable-line

export class HomePage extends React.Component {
  componentWillMount() {
    const { authenticatedUser, history } = this.props;
    if (authenticatedUser) {
      history.push('/dashboard');
    } else {
      history.push('/auth/sign-in');
    }
  }

  render() {
    return null;
  }
}

HomePage.propTypes = {
  actions: PropTypes.object,
  history: PropTypes.object
};

export default hot(reduxComponent(HomePage, state => ({
  authenticatedUser: state.appStatus.authenticatedUser
})));
