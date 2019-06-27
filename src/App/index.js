import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Switch, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import { Helmet } from 'react-helmet';
import LazyComponent from 'LazyComponent'; // eslint-disable-line
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import Spinner from 'ui/Spinner'; // eslint-disable-line

const HomePage = LazyComponent(() => import('./HomePage'));
const LoginPage = LazyComponent(() => import('./LoginPage'));
const Dashboard = LazyComponent(() => import('./Dashboard'));

export class App extends React.Component {
  state = {
    initialisingApp: false,
    appInitialised: false,
    initialiseAppError: null
  };

  componentWillMount() {
    const { actions } = this.props;
    this.setState({ initialisingApp: true });
    actions.get('initialise-app', {
      onResponse: () => this.setState({ appInitialised: true, initialisingApp: false }),
      onSuccess: ({ payload }) => actions.updateAppStatus(payload),
      onFailure: initialiseAppError => this.setState({ initialiseAppError })
    });
  }

  render() {
    const { initialisingApp, initialiseAppError } = this.state;

    if (initialisingApp) return <Spinner className="ui__flex ui__justifyContent_center" />;

    if (initialiseAppError) {
      return (
        <p>{initialiseAppError.msg || initialiseAppError.message
          || JSON.stringify(initialiseAppError)}</p>
      );
    }

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
            path="/auth/:authAction"
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
