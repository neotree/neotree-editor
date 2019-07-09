import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import reduxComponent from 'reduxComponent'; // eslint-disable-line

export class Authenticated extends React.Component {
  componentWillMount() {
    const {
      redirectToIfNotAuthenticated,
      authenticatedUser,
      history
    } = this.props;

    if (redirectToIfNotAuthenticated && !authenticatedUser) {
      history.push(redirectToIfNotAuthenticated);
    }
  }

  render() {
    const { Component, authenticatedUser, ...props } = this.props;
    return authenticatedUser ?
      <Component {...props} authenticatedUser={authenticatedUser} /> : null;
  }
}

Authenticated.propTypes = {
  history: PropTypes.object,
  authenticatedUser: PropTypes.object,
  Component: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  redirectToIfNotAuthenticated: PropTypes.string
};

const AuthenticatedDecorated = hot(
  withRouter(
    reduxComponent(Authenticated, state => ({
      authenticatedUser: state.$APP.authenticatedUser
    }))
  )
);

export default (Component, redirectToIfNotAuthenticated = '/auth/sign-in') => props => {
  return (
    <AuthenticatedDecorated
      {...props}
      Component={Component}
      redirectToIfNotAuthenticated={redirectToIfNotAuthenticated}
    />
  );
};
