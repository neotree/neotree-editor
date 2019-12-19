import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Switch, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import { Helmet } from 'react-helmet';
import LazyComponent from 'LazyComponent';
import reduxComponent from 'reduxComponent';
import Spinner from 'AppComponents/Spinner';

const HomePage = LazyComponent(() => import('./HomePage'));
const LoginPage = LazyComponent(() => import('./LoginPage'));
const Dashboard = LazyComponent(() => import('./Dashboard'));

export class App extends React.Component {
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
