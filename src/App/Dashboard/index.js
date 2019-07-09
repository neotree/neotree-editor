import React from 'react';
import PropTypes from 'prop-types';
import { hot } from 'react-hot-loader/root';
import { withRouter, Route, Switch } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import authenticated from 'authenticated'; // eslint-disable-line
import LazyComponent from 'LazyComponent'; // eslint-disable-line
import Context from './Context';

const AdminPassword = LazyComponent(() => import('./AdminPassword'));
const ConfigKeys = LazyComponent(() => import('./ConfigKeys'));
const DiagnosisEditor = LazyComponent(() => import('./Diagnoses/Editor'));
const ScreenEditor = LazyComponent(() => import('./Screens/Editor'));
const ScriptEditor = LazyComponent(() => import('./Scripts/Editor'));
const ScriptsList = LazyComponent(() => import('./Scripts/List'));
const ImportDataPage = LazyComponent(() => import('./ImportDataPage'));

export class Dashboard extends React.Component {
  render() {
    return (
      <Context.Provider value={this}>
        <div>
          <Switch>
            <Route
              exact
              path="/dashboard/new/import-firebase"
              render={routeProps => <ImportDataPage {...this.props} {...routeProps} />}
            />
            <Route
              exact
              path="/dashboard/new"
              render={routeProps => <ScriptsList {...this.props} {...routeProps} />}
            />
            <Route
              exact
              path="/dashboard/new/scripts"
              render={routeProps => <ScriptsList {...this.props} {...routeProps} />}
            />
            <Route
              exact
              path="/dashboard/new/scripts/:scriptId"
              render={routeProps => <ScriptEditor {...this.props} {...routeProps} />}
            />
            <Route
              exact
              path="/dashboard/new/scripts/:scriptId/screens/:screenId"
              render={routeProps => <ScreenEditor {...this.props} {...routeProps} />}
            />
            <Route
              exact
              path="/dashboard/new/scripts/:scriptId/diagnosis/:diagnosisId"
              render={routeProps => <DiagnosisEditor {...this.props} {...routeProps} />}
            />
            <Route
              exact
              path="/dashboard/new/adminpassword"
              render={routeProps => <AdminPassword {...this.props} {...routeProps} />}
            />
            <Route
              exact
              path="/dashboard/new/configkeys"
              render={routeProps => <ConfigKeys {...this.props} {...routeProps} />}
            />
            <Route
              path="*"
              render={routeProps => <ScriptsList {...this.props} {...routeProps} />}
            />
          </Switch>
        </div>
      </Context.Provider>
    );
  }
}

Dashboard.propTypes = {
  actions: PropTypes.object,
  authenticatedUser: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default hot(withRouter(authenticated(
  reduxComponent(Dashboard)
)));
