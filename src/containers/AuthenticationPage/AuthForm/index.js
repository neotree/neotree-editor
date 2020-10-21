/* global window */
import React from 'react';
import PropTypes from 'prop-types';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import WindowEventListener from '@/components/WindowEventListener';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@/components/Layout';
import cx from 'classnames';
import { checkEmailRegistration, authenticate } from '@/api/auth';

const useStyles = makeStyles(() => ({
  actionsWrap: { textAlign: 'right', },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
}));

const AuthForm = ({ copy }) => {
  const [state, _setState] = React.useState({
    authType: 'sign-in',
    emailRegistration: {},
    form: {
      email: '',
      password: '',
      password2: '',
    },
  });

  const setState = s => _setState(prev => ({
    ...prev,
    ...(typeof s === 'function' ? s(prev) : s),
  }));

  const setForm = s => setState(prev => ({
    form: {
      ...prev.form,
      ...(typeof s === 'function' ? s(prev.form) : s),
    },
  }));

  const {
    loading,
    authType,
    authenticateError,
    emailRegistration,
    form: {
      email,
      password,
      password2,
    },
  } = state;

  const disableAction = () => {
    let canSubmit = !loading && email;
    if (emailRegistration.userId) {
      const passwordConfirmed = password && (!emailRegistration.activated ? password === password2 : true);
      canSubmit = canSubmit && passwordConfirmed;
    }
    return canSubmit ? false : true;
  };

  const onAuthenticate = () => {
    if (disableAction(authType)) return;

    setState({ loading: true, authenticateError: null, });
    authenticate(authType, {
      id: emailRegistration.userId,
      username: email,
      password,
      password2
    })
      .then(() => { window.location.href = '/'; })
      .catch(e => {
        setState({ loading: false, authenticateError: e });
      });
  };

  const _checkEmailRegistration = () => {
    setState({ loading: true, authenticateError: null, });
    checkEmailRegistration({ email })
      .then(emailRegistration => {
        setState({
          loading: false,
          emailRegistration,
          authType: emailRegistration.userId && !emailRegistration.activated ? 'sign-up' : 'sign-in',
        });
      })
      .catch(e => setState({ loading: false, authenticateError: e, }));
  };

  const classes = useStyles();

  const errors = emailRegistration.errors || authenticateError;

  const renderActions = actions => (
    <div className={cx(classes.actionsWrap)}>
      {!!errors && errors.map((e, i) => {
        const key = i;
        return (
          <div key={key}>
            <Typography color="error" variant="caption">{e}</Typography>
          </div>
        );
      })}
      <div className={cx(classes.actions)}>
        {actions}
      </div>
    </div>
  );

  const btnLoader = !loading ? null : <CircularProgress color="secondary" size={20} />;

  return (
    <>
      <WindowEventListener
        events={{
          keyup: e => {
            if (e.keyCode !== 13) return;
            if (!emailRegistration.userId) return _checkEmailRegistration();
            onAuthenticate(authType);
          },
        }}
      >
        <div>
          <TextField
            fullWidth
            variant="outlined"
            type="email"
            name="email"
            value={email || ''}
            label={copy.EMAIL_ADDRESS_INPUT_LABEL}
            onChange={e => setForm({ email: e.target.value })}
          />
        </div>

        <br />

        <Collapse in={!emailRegistration.userId}>
          {renderActions(
            <>
              <Button
                disableElevation
                size="large"
                color="primary"
                variant="contained"
                endIcon={btnLoader}
                onClick={() => _checkEmailRegistration()}
                disabled={disableAction(authType)}
              >{copy.VERIFY_EMAIL_ADDRESS_BUTTON_TEXT}</Button>
            </>
          )}
        </Collapse>

        <Collapse in={!!emailRegistration.userId}>
          <div>
            <div>
              <TextField
                fullWidth
                variant="outlined"
                type="password"
                name="password"
                value={password || ''}
                label={copy.PASSWORD_INPUT_LABEL}
                onChange={e => setForm({ password: e.target.value })}
              />
            </div>

            <br />

            {authType === 'sign-up' && (
              <>
                <br />

                <div>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="password"
                    name="password2"
                    value={password2 || ''}
                    label={copy.PASSWORD_INPUT_LABEL}
                    onChange={e => setForm({ password2: e.target.value })}
                  />
                </div>

                <br />
              </>
            )}

            {renderActions(
              <>
                <Button
                  disableElevation
                  size="large"
                  color="primary"
                  variant="contained"
                  endIcon={btnLoader}
                  onClick={() => onAuthenticate()}
                  disabled={disableAction(authType)}
                >
                  {copy.SUBMIT_BUTTON_LABEL}
                </Button>
              </>
            )}
          </div>
        </Collapse>
      </WindowEventListener>
    </>
  );
};

AuthForm.propTypes = {
  copy: PropTypes.object.isRequired,
};

export default AuthForm;
