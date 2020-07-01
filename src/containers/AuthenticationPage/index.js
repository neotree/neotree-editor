import React from 'react';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import LazyComponent from '@/components/LazyComponent';
import authCopy from '@/constants/copy/authentication';
import { makeStyles } from '@/components/Layout';
import cx from 'classnames';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Logo from '@/components/Logo';
import { Switch, Route, Redirect, useParams } from 'react-router-dom';
import { provideAuthPageContext } from './Context';

const lazyComponentOpts = {
  LoaderComponent: () => (
    <div style={{ textAlign: 'center' }}>
      <CircularProgress size={20} />
    </div>
  )
};

const AuthForm = LazyComponent(
  () => import('./AuthForm'),
  lazyComponentOpts
);

const ForgotPasswordForm = LazyComponent(
  () => import('./ForgotPasswordForm'),
  lazyComponentOpts
);

const ChangePasswordForm = LazyComponent(
  () => import('./ChangePasswordForm'),
  lazyComponentOpts
);

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overlay: 'auto',
    display: 'flex',
  },
  rootInner: {
    margin: 'auto',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    margin: theme.spacing(),
  },
  paper: {
    margin: '25px auto',
    padding: theme.spacing(2),
  },
  paperWidth: ({ _layout }) => ({
    width: '90%',
    maxWidth: _layout.AUTH_FORM_WIDTH,
  }),
}));

const AuthenticationPage = () => {
  const { authType } = useParams();
  const classes = useStyles();
  const copy = { ...authCopy, ...authType ? authCopy[authType] : null };

  const formProps = { authType, copy, };

  return (
    <>
      {renderDocumentTitle(copy.PAGE_TITLE)}

      <div className={cx(classes.root)}>
        <div className={cx(classes.rootInner)}>
          <Paper className={cx(classes.paper, classes.paperWidth)}>
            <div className={cx(classes.header)}>
              <Logo />
              <br />
              <Typography variant="button">{copy.FORM_TITLE}</Typography>
            </div>

            <br />

            <Switch>
              <Route
                exact
                path="/sign-in"
                render={routeParams => <AuthForm {...routeParams} authType="/sign-in" {...formProps} />}
              />

              <Route
                exact
                path="/sign-up"
                render={routeParams => <AuthForm {...routeParams} authType="/sign-up" {...formProps} />}
              />

              <Route
                exact
                path="/forgot-password"
                render={routeParams => <ForgotPasswordForm {...routeParams} {...formProps} />}
              />

              <Route
                exact
                path="/change-password"
                render={routeParams => <ChangePasswordForm {...routeParams} {...formProps} />}
              />

              <Route path="/" render={() => <Redirect to="/sign-in" />} />
            </Switch>
          </Paper>
        </div>
      </div>
    </>
  );
};

export default provideAuthPageContext(AuthenticationPage);
