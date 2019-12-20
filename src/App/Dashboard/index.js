/* global document */
import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { Link, withRouter, Route, Switch } from 'react-router-dom';
import { MdMoreVert } from 'react-icons/md';
import reduxComponent from 'reduxComponent';
import authenticated from 'authenticated';
import {
  Button,
  Content,
  Drawer,
  Layout,
  Header,
  Navigation,
  Menu,
  MenuItem
} from 'react-mdl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import LazyComponent from 'LazyComponent';

const AdminPassword = LazyComponent(() => import('./AdminPassword'));
const ConfigKeys = LazyComponent(() => import('./ConfigKeys'));
const DiagnosisEditor = LazyComponent(() => import('./Diagnoses/Editor'));
const ScreenEditor = LazyComponent(() => import('./Screens/Editor'));
const ScriptEditor = LazyComponent(() => import('./Scripts/Editor'));
const ScriptsList = LazyComponent(() => import('./Scripts/List'));
const ImportDataPage = LazyComponent(() => import('./ImportDataPage'));
const Users = LazyComponent(() => import('./Users'));

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

  componentDidMount() {
    const header = document.getElementById('dashboard-header');
    header.children[0].classList.add('ui__flex');
    header.children[0].classList.add('ui__alignItems_center');
    header.children[0].innerHTML = `
      <svg style="margin-top:-10px;" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="font-size: 24px;">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
      </svg>
    `;
  }

  setToolbarTitle = (title) => this.setState({
    ...this.state,
    toolbarTitle: title
  });

  handleLogoutClick = () => {
    const { actions } = this.props;
    this.setState({ loggingOut: true });
    actions.get('logout', {
      onResponse: () => this.setState({
        loggingOut: false,
        openLogoutConfirmDialog: false
      }),
      onFailure: logOutFailure => this.setState({ logOutFailure }),
      onSuccess: () => {
        actions.$updateApp({ authenticatedUser: null });
        global.window.location.href = '/auth/sign-in';
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
    const { authenticatedUser } = this.props;
    const { toolbarTitle } = this.state;
    const styles = {
      container: { height: '100%' },
      content: { backgroundColor: '#f0f0f0', padding: '48px' }
    };

    return (
      <div style={styles.container}>
        <Layout ref="layout" fixedHeader fixedDrawer>
          <Header id="dashboard-header" title={toolbarTitle}>
            <div className="ui__cursor_pointer" id="actionbar-menu">
              <MdMoreVert style={{ fontSize: '24px' }} />
            </div>
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
              {authenticatedUser.role > 0 &&
                <Link onClick={this.toggleDrawer} to="/dashboard/users">Users</Link>}
              {/*<Link onClick={this.toggleDrawer} to="/users">Users</Link>*/}
            </Navigation>
          </Drawer>
          <Content style={styles.content}>
            <Switch>
              <Route
                exact
                path="/dashboard/import-firebase"
                render={routeProps => <ImportDataPage {...this.props} {...routeProps} />}
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
              {authenticatedUser.role > 0 &&
                <Route
                  exact
                  path="/dashboard/users"
                  render={routeProps => <Users {...this.props} {...routeProps} />}
                />}
              <Route
                path="*"
                render={routeProps => <ScriptsList {...this.props} {...routeProps} />}
              />
            </Switch>
          </Content>
        </Layout>
        <Dialog
          open={this.state.openLogoutConfirmDialog}
          onClose={() => {}}
          fullWidth
          maxWidth="sm"
        >
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
