import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Switch, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import { Helmet } from 'react-helmet';
import LazyComponent from 'LazyComponent';
import reduxComponent from 'reduxComponent';
import Spinner from 'AppComponents/Spinner';
import io from 'socket.io-client';

const socket = io();

const HomePage = LazyComponent(() => import('./HomePage'));
const LoginPage = LazyComponent(() => import('./LoginPage'));
const Dashboard = LazyComponent(() => import('./Dashboard'));

export class App extends React.Component {
  componentDidMount() {
    const onSocket = data => console.log('socket event', data); // eslint-disable-line
    socket.on('update_scripts', onSocket);
    socket.on('delete_scripts', onSocket);
    socket.on('create_scripts', onSocket);
    socket.on('update_screens', onSocket);
    socket.on('delete_screens', onSocket);
    socket.on('create_screens', onSocket);
    socket.on('update_diagnoses', onSocket);
    socket.on('delete_diagnoses', onSocket);
    socket.on('create_diagnoses', onSocket);
    socket.on('updateconfig_keys', onSocket);
    socket.on('deleteconfig_keys', onSocket);
    socket.on('createconfig_keys', onSocket);
  }

  render() {
    return (
      <div id="neotree-app" className="neotree-app">
        <Helmet>
          <title>NeoTree</title>
        </Helmet>

        <Switch>
          <Route
            path="/dashboard"
            render={routeProps => <Dashboard {...this.props} {...routeProps} />}
          />
          <Route
            exact
            path="/auth/sign-in"
            render={routeProps => <LoginPage {...this.props} {...routeProps} />}
          />
          <Route
            path="*"
            render={routeProps => <HomePage {...this.props} {...routeProps} />}
          />
        </Switch>
      </div>
    );
  }
}

App.propTypes = {
  actions: PropTypes.object
};

export default hot(withRouter(reduxComponent(App)));
