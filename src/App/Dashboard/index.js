import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { Link, withRouter, Route, Switch } from 'react-router-dom';
import reduxComponent from 'reduxComponent'; // eslint-disable-line
import authenticated from 'authenticated'; // eslint-disable-line
import {
  Button,
  Content,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  IconButton,
  Layout,
  Header,
  Navigation,
  Menu,
  MenuItem
} from 'react-mdl';
import LazyComponent from 'LazyComponent'; // eslint-disable-line

const AdminPassword = LazyComponent(() => import('./AdminPassword'));
const ConfigKeys = LazyComponent(() => import('./ConfigKeys'));
const DiagnosisEditor = LazyComponent(() => import('./Diagnosis/Editor'));
const ScreenEditor = LazyComponent(() => import('./Screens/Editor'));
const ScriptEditor = LazyComponent(() => import('./Scripts/Editor'));
const ScriptsList = LazyComponent(() => import('./Scripts/List'));
const ImportFirebasePage = LazyComponent(() => import('./ImportFirebasePage'));

export class Dashboard extends React.Component {
  static childContextTypes = { setToolbarTitle: PropTypes.func };

  constructor(props) {
    super(props);
    this.state = {
      loggingOut: false,
      toolbarTitle: 'Dashboard',
      openLogoutConfirmDialog: false
    };
  }

  getChildContext = () => ({ setToolbarTitle: this.setToolbarTitle });

  setToolbarTitle = (title) => this.setState({
    ...this.state,
    toolbarTitle: title
  });

  handleLogoutClick = () => {
    const { actions, history } = this.props;
    this.setState({ loggingOut: true });
    actions.get('logout', {
      onResponse: () => this.setState({
        loggingOut: false,
        openLogoutConfirmDialog: false
      }),
      onFailure: logOutFailure => this.setState({ logOutFailure }),
      onSuccess: () => {
        actions.updateAppStatus({ authenticatedUser: null });
        history.push('/auth/sign-in');
      }
    });
  };

  openLogoutConfirmDialog = () => this.setState({
    openLogoutConfirmDialog: true
  });

  closeLogoutConfirmDialog = () => this.setState({
    openLogoutConfirmDialog: false
  });

  toggleDrawer = () => {
    const layout = findDOMNode(this.refs.layout);
    if (layout.classList.contains('is-small-screen')) {
      layout.MaterialLayout.toggleDrawer();
    }
  };

  render() {
    const { toolbarTitle } = this.state;
    const styles = {
      container: { height: '100%' },
      content: { backgroundColor: '#f0f0f0', padding: '48px' }
    };

    return (
      <div style={styles.container}>
        <Layout ref="layout" fixedHeader fixedDrawer>
          <Header title={toolbarTitle}>
            <IconButton name="more_vert" id="actionbar-menu" />
            <Menu target="actionbar-menu" align="right">
              <MenuItem>Profile</MenuItem>
              <MenuItem onClick={this.openLogoutConfirmDialog}>Sign out</MenuItem>
            </Menu>
          </Header>
          <Drawer title="Neo Tree">
            <Navigation>
              <Link onClick={this.toggleDrawer} to="/dashboard/adminpassword">Admin Password</Link>
              <Link onClick={this.toggleDrawer} to="/dashboard/configkeys">Configuration</Link>
              {/*<Link onClick={this.toggleDrawer} to="/images">Images</Link>*/}
              <Link onClick={this.toggleDrawer} to="/dashboard/scripts">Scripts</Link>
              <Link onClick={this.toggleDrawer} to="/dashboard/import-firebase">Import firebase</Link>
              {/*<Link onClick={this.toggleDrawer} to="/users">Users</Link>*/}
            </Navigation>
          </Drawer>
          <Content style={styles.content}>
            <Switch>
              <Route
                exact
                path="/dashboard/import-firebase"
                render={routeProps => <ImportFirebasePage {...this.props} {...routeProps} />}
              />
              <Route
                exact
                path="/dashboard"
                render={routeProps => <ScriptsList {...this.props} {...routeProps} />}
              />
              <Route
                exact
                path="/dashboard/scripts"
                render={routeProps => <ScriptsList {...this.props} {...routeProps} />}
              />
              <Route
                exact
                path="/dashboard/scripts/:scriptId"
                render={routeProps => <ScriptEditor {...this.props} {...routeProps} />}
              />
              <Route
                exact
                path="/dashboard/scripts/:scriptId/screens/:screenId"
                render={routeProps => <ScreenEditor {...this.props} {...routeProps} />}
              />
              <Route
                exact
                path="/dashboard/scripts/:scriptId/diagnosis/:diagnosisId"
                render={routeProps => <DiagnosisEditor {...this.props} {...routeProps} />}
              />
              <Route
                exact
                path="/dashboard/adminpassword"
                render={routeProps => <AdminPassword {...this.props} {...routeProps} />}
              />
              <Route
                exact
                path="/dashboard/configkeys"
                render={routeProps => <ConfigKeys {...this.props} {...routeProps} />}
              />
              <Route
                path="*"
                render={routeProps => <ScriptsList {...this.props} {...routeProps} />}
              />
            </Switch>
          </Content>
        </Layout>
        <Dialog open={this.state.openLogoutConfirmDialog}>
          <DialogTitle>Sign out</DialogTitle>
          <DialogContent>
            <p>You are about to sign out. All unsaved changes will be lost.</p>
          </DialogContent>
          <DialogActions>
            <Button type='button' onClick={this.handleLogoutClick} accent>Sign out</Button>
            <Button type='button' onClick={this.closeLogoutConfirmDialog}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </div>
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
