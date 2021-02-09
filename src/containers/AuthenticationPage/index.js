import React from 'react';
import LazyPage from '@/components/LazyPage';
import authCopy from '@/constants/copy/authentication';
import makeStyles from '@material-ui/core/styles/makeStyles';
import cx from 'classnames';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Logo from '@/components/Logo';
import { Switch, Route, Redirect, useParams } from 'react-router-dom';
import { setDocumentTitle } from '@/AppContext';

const AuthForm = LazyPage(() => import('./AuthForm'));
const ForgotPasswordForm = LazyPage(() => import('./ForgotPasswordForm'));
const ChangePasswordForm = LazyPage(() => import('./ChangePasswordForm'));

const SignIn = props => <AuthForm {...props} authType="sign-in" />;

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overlay: 'auto',
    display: 'flex',
    backgroundColor: theme.palette.background.default,
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
  paperWidth: {
    width: '90%',
    maxWidth: 350,
  },
}));

const AuthenticationPage = () => {
  const { authType } = useParams();
  const classes = useStyles();
  const copy = { ...authCopy, ...authType ? authCopy[authType] : null };

  setDocumentTitle(copy.PAGE_TITLE);

  const formProps = { authType, copy, };

  return (
    <>
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
                render={routeParams => <SignIn {...routeParams} {...formProps} />}
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

export default AuthenticationPage;
