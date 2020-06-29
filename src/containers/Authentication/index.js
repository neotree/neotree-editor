import React from 'react';
import PropTypes from 'prop-types';
import renderDocumentTitle from '@/components/renderDocumentTitle';
import LazyComponent from '@/components/LazyComponent';
import copy from '@/constants/copy/authentication';
import { makeStyles } from '@/components/Layout';
import cx from 'classnames';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Logo from '@/components/Logo';

const AuthForm = LazyComponent(() => import('./AuthForm'));
const ForgotPasswordForm = LazyComponent(() => import('./ForgotPasswordForm'));
const ChangePasswordForm = LazyComponent(() => import('./ChangePasswordForm'));

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

const getPageItems = authType => {
  switch (authType) {
    case 'forgot-password':
      return { copy: copy['forgot-password'], Form: ForgotPasswordForm };
    case 'change-password':
      return { copy: copy['change-password'], Form: ChangePasswordForm };
    case 'sign-in':
      return { copy: copy['sign-in'], Form: AuthForm };
    case 'sign-up':
      return { copy: copy['sign-up'], Form: AuthForm };
    default:
      return { copy: null, noMatch: true, Form: null };
  }
};

const Authentication = ({ authType }) => {
  const classes = useStyles();

  const { copy: _copy, Form, noMatch } = getPageItems(authType);

  if (noMatch) return null;

  return (
    <>
      {renderDocumentTitle(_copy.PAGE_TITLE)}

      <div className={cx(classes.root)}>
        <div className={cx(classes.rootInner)}>
          <Paper className={cx(classes.paper, classes.paperWidth)}>
            <div className={cx(classes.header)}>
              <Logo />
              <br />
              <Typography variant="button">{_copy.FORM_TITLE}</Typography>
            </div>

            <Form copy={{ ...copy, ..._copy }} authType={authType} />
          </Paper>
        </div>
      </div>
    </>
  );
};

Authentication.propTypes = {
  authType: PropTypes.oneOf(['sign-in', 'sign-up', 'forgot-password', 'change-password']).isRequired,
};

export default Authentication;
